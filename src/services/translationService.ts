import TRANSLATION_CONFIG from "../config/translationConfig";
import { DEFAULT_WORD_PROMPT, DEFAULT_SENTENCE_PROMPT } from "../config/translationConfig";

export async function translateText(text: string, promptType: "sentence" | "word", customPrompt?: string): Promise<string> {
  let prompt = "";
  if (customPrompt) {
    prompt = `${customPrompt} ${text}`;
  } else {
    prompt = promptType === "sentence"
      ? `${DEFAULT_SENTENCE_PROMPT} ${text}`
      : `${DEFAULT_WORD_PROMPT} ${text}`;
  }

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

  if (!response.ok) {
    throw new Error("Translation API error");
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
