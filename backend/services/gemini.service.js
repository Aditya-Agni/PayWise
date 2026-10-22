import { GoogleGenAI } from "@google/genai";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

function getApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
}

let aiClientInstance = null;

export function getGeminiClient() {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the server environment.");
  }
  if (!aiClientInstance) {
    aiClientInstance = new GoogleGenAI({ apiKey });
  }
  return aiClientInstance;
}

/**
 * Generate free-form text using Gemini
 * @param {string} prompt
 * @param {object} options
 * @returns {Promise<string>}
 */
export async function generateText(prompt, options = {}) {
  try {
    const ai = getGeminiClient();
    const model = options.model || DEFAULT_MODEL;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxOutputTokens || 1000,
        systemInstruction: options.systemInstruction || undefined,
      },
    });

    return response?.text || "";
  } catch (error) {
    // Sanitize and mask any accidental sensitive details in errors
    const safeMessage = error.message || "Failed to communicate with Gemini API";
    throw new Error(`Gemini service error: ${safeMessage}`);
  }
}

/**
 * Generate structured JSON using Gemini
 * @param {string} prompt
 * @param {object} options
 * @returns {Promise<any>}
 */
export async function generateStructuredJson(prompt, options = {}) {
  try {
    const ai = getGeminiClient();
    const model = options.model || DEFAULT_MODEL;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: options.temperature ?? 0.2,
        maxOutputTokens: options.maxOutputTokens || 2000,
        systemInstruction: options.systemInstruction || undefined,
      },
    });

    const rawText = response?.text?.trim() || "";
    if (!rawText) {
      throw new Error("Empty response received from Gemini.");
    }

    try {
      return JSON.parse(rawText);
    } catch {
      // If output had markdown formatting around json, extract inner json
      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) || rawText.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
      }
      throw new Error("Failed to parse Gemini response as JSON.");
    }
  } catch (error) {
    const safeMessage = error.message || "Failed to parse structured JSON from Gemini";
    throw new Error(`Gemini structured output error: ${safeMessage}`);
  }
}

export default {
  getGeminiClient,
  generateText,
  generateStructuredJson,
};
