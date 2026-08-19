export interface AssistantAnswer {
  answer: string;
  sources: string[];
}

export async function askAssistant(question: string): Promise<AssistantAnswer> {
  const baseUrl = process.env.NEXT_PUBLIC_ASSISTANT_API_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_ASSISTANT_API_URL não configurada");
  }

  const res = await fetch(`${baseUrl}/assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    throw new Error(`Assistant request failed: ${res.status}`);
  }

  return res.json();
}
