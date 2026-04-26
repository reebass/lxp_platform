/**
 * AI Service HTTP client.
 * Used ONLY in Server Actions — never import this on the client side.
 */

const AI_BASE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export type AiAction = 'summarize' | 'format_steps' | 'suggest_title' | 'generate';

interface GenerateTextResponse {
  result: string;
}

/**
 * Send a text generation request to the FastAPI ai-service.
 */
export async function generateText(
  prompt: string,
  action: AiAction,
  context?: string,
): Promise<GenerateTextResponse> {
  const res = await fetch(`${AI_BASE_URL}/api/generate/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, action, context }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`AI service error (${res.status}): ${body}`);
  }

  return res.json();
}
