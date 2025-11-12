import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { Buffer } from "node:buffer";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/request-client";
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

    const prospectRows = parseResult.rows.map((row) => {
      const prospectId = randomUUID();
      const value = (key: string) => row[key] ?? "";
      return {
        id: prospectId,
        campaign_id: campaignId,
        row_index: row.row_index,
        company_url: value("company_url"),
        anrede: value("anrede"),
        vorname: value("vorname"),
        nachname: value("nachname"),
        strasse: value("strasse"),
        hausnummer: value("hausnummer"),
        plz: value("plz"),
        ort: value("ort"),
      };
    });

    if (prospectRows.length) {
      const { error: prospectInsertError } = await supabase
        .from("campaign_prospects")
        .insert(prospectRows);

      if (prospectInsertError) {
        throw prospectInsertError;
      }
    }

    const generatedBucket = env.SUPABASE_STORAGE_BUCKET_STATIC;
    const prospectsPayload = prospectRows.map((prospect) => {
      const basePath = `campaigns/${campaignId}/prospects/${prospect.id}`;
      return {
        prospectId: prospect.id,
        rowIndex: prospect.row_index,
        storage: {
          bucket: generatedBucket,
          basePath,
          video: `${basePath}/video.mp4`,
          slides: `${basePath}/slides.pdf`,
          flyer: `${basePath}/flyer.pdf`,
        },
      };
    });

    const payload = {
      campaignId,
      userId: user.id,
      excelPath: excelUpload.path,
      servicePdfPath: pdfUpload.path,
      callbackUrl: env.N8N_GENERATION_CALLBACK_URL,
      storageBuckets: {
        source: env.SUPABASE_STORAGE_BUCKET_UPLOADS,
        generated: generatedBucket,
      },
      metadata: {
        name,
        rowCount: parseResult.rowCount,
      },
      prospects: prospectsPayload,
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
