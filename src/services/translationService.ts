import TRANSLATION_CONFIG from "../config/translationConfig";

export async function translateText(text: string, promptType: "sentence" | "word"): Promise<string> {
  const prompt =
    promptType === "sentence"
      ? `Переведи на русский: ${text}`
      : `Переведи слово на русский: ${text}`;

  const response = await fetch(TRANSLATION_CONFIG.apiUrl, {
    method: "POST",
    headers: {
      Authorization: TRANSLATION_CONFIG.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: TRANSLATION_CONFIG.model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No response";
}
