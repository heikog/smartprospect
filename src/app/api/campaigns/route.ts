import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { Buffer } from "node:buffer";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route";
import { parseProspectBuffer } from "@/lib/prospect-parser";
import { uploadCampaignAsset } from "@/lib/storage";
import { triggerN8nWorkflow } from "@/lib/n8n";
import { env } from "@/lib/env.server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const { supabase, response } = createSupabaseRouteHandlerClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Nicht angemeldet" }, { status: 401 });
  }

  const name = formData.get("name")?.toString().trim();
  const excelFile = formData.get("prospects");
  const pdfFile = formData.get("servicePdf");

  if (!name || !(excelFile instanceof File) || !(pdfFile instanceof File)) {
    return NextResponse.json({ message: "Bitte alle Felder ausfüllen" }, { status: 400 });
  }

  const campaignId = randomUUID();
  const excelBuffer = Buffer.from(await excelFile.arrayBuffer());
  const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());

  let parseResult;
  try {
    parseResult = parseProspectBuffer(excelBuffer, excelFile.name || "prospects.xlsx");
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 400 });
  }

  if (parseResult.rowCount === 0) {
    return NextResponse.json({ message: "Keine gültigen Zeilen gefunden" }, { status: 400 });
  }

  try {
    const [excelUpload, pdfUpload] = await Promise.all([
      uploadCampaignAsset({
        campaignId,
        folder: "excel",
        buffer: excelBuffer,
        filename: excelFile.name,
        contentType:
          excelFile.type || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      uploadCampaignAsset({
        campaignId,
        folder: "service-pdf",
        buffer: pdfBuffer,
        filename: pdfFile.name,
        contentType: pdfFile.type || "application/pdf",
      }),
    ]);

    const { data: insertedCampaign, error } = await supabase
      .from("campaigns")
      .insert([
        {
          id: campaignId,
          user_id: user.id,
          name,
          row_count: parseResult.rowCount,
          source_excel_path: excelUpload.path,
          service_pdf_path: pdfUpload.path,
        },
      ])
      .select()
      .maybeSingle();

    if (error) {
      if (error.message.includes("INSUFFICIENT_CREDITS")) {
        return NextResponse.json({ message: "Nicht genügend Credits. Bitte Credits kaufen." }, { status: 402 });
      }
      throw error;
    }

    const payload = {
      campaignId,
      userId: user.id,
      excelPath: excelUpload.path,
      servicePdfPath: pdfUpload.path,
      callbackUrl: env.N8N_GENERATION_CALLBACK_URL,
      metadata: {
        name,
        rowCount: parseResult.rowCount,
      },
    };

    await triggerN8nWorkflow(env.N8N_GENERATION_WEBHOOK_URL, payload);

    return new NextResponse(
      JSON.stringify({
        campaign: insertedCampaign,
        invalidRowCount: parseResult.invalidRowCount,
      }),
      {
        status: 201,
        headers: response.headers,
      },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
