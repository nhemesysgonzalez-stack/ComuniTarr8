
import { GroundingLink } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export const getAssistantResponse = async (prompt: string): Promise<{ text: string; links?: GroundingLink[] }> => {
  if (!API_KEY) {
    return { text: "❌ ERROR: No se encuentra la VITE_GEMINI_API_KEY." };
  }

  // Cambiamos a 1.5-flash que es el más estable para cuotas gratuitas iniciales
  const MODEL_ID = "gemini-1.5-flash";

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
            maxOutputTokens: 500 // Bajamos tokens para no saturar si la cuota es baja
          }
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (data.error?.message?.includes("quota") || data.error?.message?.includes("limit: 0")) {
        return { text: "⚠️ Google aún no ha activado tu cuota gratuita (Limit: 0). Esto suele ocurrir si la cuenta es nueva o necesita verificar el teléfono en AI Studio. El sistema lo intentará de nuevo automáticamente en unas horas." };
      }
      return { text: `❌ ERROR DE GOOGLE: ${data.error?.message || "Acceso restringido"}` };
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Respuesta recibida.";
    return { text: aiText };
  } catch (error: any) {
    return { text: "❌ ERROR DE CONEXIÓN: Revisa tu internet." };
  }
};

export const getSearchGroundedInfo = async (query: string) => ({ text: "No disponible", links: [] });
export const getMapsGroundedPlaces = async (query: string) => ({ text: "No disponible", links: [] });
