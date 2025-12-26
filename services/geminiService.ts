
import { GroundingLink } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export const getAssistantResponse = async (prompt: string): Promise<{ text: string; links?: GroundingLink[] }> => {
  if (!API_KEY) {
    return { text: "❌ ERROR: No se encuentra la VITE_GEMINI_API_KEY." };
  }

  // Usamos gemini-2.0-flash que es el que tu clave permite explícitamente y es super moderno
  const MODEL_ID = "gemini-2.0-flash";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: {
            parts: [{ text: "Eres un asistente comunitario útil para Tarragona. Responde de forma amable y concisa." }]
          }
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { text: `❌ ERROR DE GOOGLE: ${data.error?.message || "Acceso denegado"}` };
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, no pude generar una respuesta.";
    return { text: aiText };
  } catch (error: any) {
    return { text: "❌ ERROR DE CONEXIÓN: Revisa tu internet." };
  }
};

export const getSearchGroundedInfo = async (query: string) => ({ text: "No disponible", links: [] });
export const getMapsGroundedPlaces = async (query: string) => ({ text: "No disponible", links: [] });
