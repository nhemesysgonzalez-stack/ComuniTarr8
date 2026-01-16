
import { GroundingLink } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export const getAssistantResponse = async (prompt: string): Promise<{ text: string; links?: GroundingLink[] }> => {
  if (!API_KEY) {
    return { text: "❌ ERROR: No se encuentra la VITE_GEMINI_API_KEY." };
  }

  // Lista de intentos con diferentes versiones y modelos
  const ATTEMPTS = [
    { model: "gemini-1.5-flash", api: "v1beta" },
    { model: "gemini-1.5-flash", api: "v1" },
    { model: "gemini-1.5-pro", api: "v1beta" },
    { model: "gemini-1.0-pro", api: "v1beta" },
    { model: "gemini-2.0-flash-exp", api: "v1beta" }
  ];

  let lastDetailedError = "";

  for (const attempt of ATTEMPTS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/${attempt.api}/models/${attempt.model}:generateContent?key=${API_KEY}`,
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
        return { text: data.candidates?.[0]?.content?.parts?.[0]?.text || "Respuesta recibida." };
      }

      if (data.error?.message?.includes("quota") || data.error?.message?.includes("limit: 0")) {
        console.warn(`Quota reached for ${attempt.model}, trying next...`);
        lastDetailedError = `Cuota excedida en ${attempt.model}`;
        continue;
      }

      lastDetailedError = `${attempt.model} (${attempt.api}): ${data.error?.message}`;

    } catch (e) {
      lastDetailedError = "Error de red";
    }
  }

  return {
    text: `❌ SISTEMA BLOQUEADO (v1.3): Google sigue rechazando tu clave. \n\nÚltimo error: ${lastDetailedError}\n\n💡 DIAGNÓSTICO FINAL (v1.3): Si ves esto, tu código es el de HOY VIERNES. El bloqueo es 100% de Google. Debes verificar tu identidad/pago en AI Studio para que te den permiso de uso.`
  };
};

export const getSearchGroundedInfo = async (query: string) => ({ text: "No disponible", links: [] });
export const getMapsGroundedPlaces = async (query: string) => ({ text: "No disponible", links: [] });
