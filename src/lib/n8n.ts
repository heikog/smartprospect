import { env } from "@/lib/env";

export async function triggerN8nWorkflow(url: string, payload: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(env.N8N_SHARED_SECRET ? { [env.N8N_AUTH_HEADER]: env.N8N_SHARED_SECRET } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`n8n Workflow fehlgeschlagen (${response.status}): ${body}`);
  }

  return response.json().catch(() => ({}));
}
