// Shared helper to call Lovable AI Gateway with a single forced tool-call
// and return structured JSON. Mirrors the pattern used by clarity-insight
// so all AI report flows share one error contract.

export interface GenerateReportParams {
  systemPrompt: string;
  userPrompt: string;
  toolName: string;
  toolSchema: Record<string, unknown>;
  model?: string;
}

export type GenerateReportResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; error: string; status?: number };

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-3-flash-preview";

export async function generateReport(
  params: GenerateReportParams,
): Promise<GenerateReportResult> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return { ok: false, error: "LOVABLE_API_KEY is not configured", status: 500 };
  }

  try {
    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: params.model || DEFAULT_MODEL,
        messages: [
          { role: "system", content: params.systemPrompt },
          { role: "user", content: params.userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: params.toolName,
              description: `Return the structured ${params.toolName} payload`,
              parameters: params.toolSchema,
            },
          },
        ],
        tool_choice: { type: "function", function: { name: params.toolName } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return { ok: false, error: "Rate limited. Please try again in a moment.", status: 429 };
      }
      if (response.status === 402) {
        return { ok: false, error: "AI credits exhausted. Please add funds.", status: 402 };
      }
      const detail = await response.text().catch(() => "");
      console.error("generate-report gateway error:", response.status, detail);
      return { ok: false, error: "AI gateway error", status: response.status };
    }

    const data = await response.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return { ok: false, error: "No tool call in response", status: 502 };
    }

    try {
      const parsed = JSON.parse(toolCall.function.arguments);
      return { ok: true, data: parsed };
    } catch {
      return { ok: false, error: "Malformed tool call arguments", status: 502 };
    }
  } catch (e) {
    console.error("generate-report exception:", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unknown error",
      status: 500,
    };
  }
}