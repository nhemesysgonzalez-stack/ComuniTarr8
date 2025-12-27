
import { GroundingLink } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export const getAssistantResponse = async (prompt: string): Promise<{ text: string; links?: GroundingLink[] }> => {
  if (!API_KEY) {
    return { text: "❌ ERROR: No se encuentra la VITE_GEMINI_API_KEY." };
  }

  // Usamos el modelo 'lite' que aparecía en tu lista de permitidos
  // A veces los modelos lite tienen cuotas más abiertas que los estándar
  const MODEL_ID = "gemini-2.0-flash-lite";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Informe detallado para saber si es cuota o modelo
      return { text: `❌ ERROR DE GOOGLE (${response.status}): ${data.error?.message || "Error desconocido"}` };
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No pude generar una respuesta.";
    return { text: aiText };
  } catch (error: any) {
    return { text: "❌ ERROR DE CONEXIÓN: Revisa tu internet." };
  }
};

export const getSearchGroundedInfo = async (query: string) => ({ text: "No disponible", links: [] });
export const getMapsGroundedPlaces = async (query: string) => ({ text: "No disponible", links: [] });
