
import { GroundingLink } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export const getAssistantResponse = async (prompt: string): Promise<{ text: string; links?: GroundingLink[] }> => {
  if (!API_KEY) {
    return { text: "❌ ERROR: No se encuentra la VITE_GEMINI_API_KEY." };
  }

  // Intentamos con el modelo 1.5 Flash que es el más estable en la cuota gratuita
  const MODEL_ID = "gemini-1.5-flash";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: {
            parts: [{ text: "Eres un asistente comunitario útil para la ciudad de Tarragona. Responde de forma amable, cercana y concisa." }]
          }
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Si el 1.5 falla por cuota, intentamos el 1.5-8b que es más ligero y suele tener cuota aparte
      if (data.error?.message?.includes("quota") || response.status === 429) {
        return retryWithLighterModel(prompt);
      }
      return { text: `❌ ERROR DE GOOGLE (${response.status}): ${data.error?.message || "Error desconocido"}` };
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, no pude generar una respuesta.";
    return { text: aiText };
  } catch (error: any) {
    return { text: "❌ ERROR DE CONEXIÓN: Revisa tu internet." };
  }
};

async function retryWithLighterModel(prompt: string) {
  const MODEL_ID = "gemini-1.5-flash-8b";
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
    const data = await response.json();
    return { text: data.candidates?.[0]?.content?.parts?.[0]?.text || "La cuota gratuita de Google está agotada por hoy. Prueba en unos minutos." };
  } catch (e) {
    return { text: "❌ Error de cuota persistente en Google." };
  }
}

export const getSearchGroundedInfo = async (query: string) => ({ text: "No disponible", links: [] });
export const getMapsGroundedPlaces = async (query: string) => ({ text: "No disponible", links: [] });
