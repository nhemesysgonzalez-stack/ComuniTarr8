
import { GroundingLink } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export const getAssistantResponse = async (prompt: string): Promise<{ text: string; links?: GroundingLink[] }> => {
  if (!API_KEY) {
    return { text: "❌ ERROR: No se encuentra la VITE_GEMINI_API_KEY." };
  }

  // Lista de modelos a intentar en orden de preferencia
  const MODELS = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-pro"
  ];

  let lastError = "";

  for (const model of MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Respuesta recibida.";
        return { text: aiText };
      }

      // Si es un error de cuota, lo mostramos directamente porque no servirá de nada probar otro modelo
      if (data.error?.message?.includes("quota") || data.error?.message?.includes("limit: 0")) {
        return { text: "⚠️ Google aún no ha activado tu cuota gratuita (Limit: 0). Tu cuenta está bien configurada, pero Google tarda entre 12 y 24h en 'abrir el grifo' para llaves nuevas. ¡Prueba de nuevo en unas horas!" };
      }

      lastError = data.error?.message || "Error desconocido";
      console.log(`Modelo ${model} falló, probando el siguiente...`);

    } catch (error: any) {
      lastError = "Error de conexión";
    }
  }

  return { text: `❌ ERROR FINAL: Ningún modelo de Google respondió. El último error fue: ${lastError}` };
};

export const getSearchGroundedInfo = async (query: string) => ({ text: "No disponible", links: [] });
export const getMapsGroundedPlaces = async (query: string) => ({ text: "No disponible", links: [] });
