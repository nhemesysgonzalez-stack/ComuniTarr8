
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { GroundingLink } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export const getAssistantResponse = async (prompt: string): Promise<{ text: string; links?: GroundingLink[] }> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "Eres un asistente comunitario inteligente para la ciudad de Tarragona, España. Ayudas a los vecinos con información local, eventos, y servicios comunitarios. Sé amable, servicial y utiliza un tono cercano.",
      },
    });

    return { text: response.text || "Lo siento, no pude procesar tu solicitud." };
  } catch (error: any) {
    console.error("Gemini Assistant Error:", error);
    if (error.message?.includes("API key")) {
      return { text: "Error: Falta la clave de API de Gemini. Configúrala en Vercel." };
    }
    return { text: "Hubo un error al conectar con el asistente. Inténtalo más tarde." };
  }
};

export const getSearchGroundedInfo = async (query: string): Promise<{ text: string; links: GroundingLink[] }> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Proporciona información actualizada sobre: ${query} en Tarragona.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No se encontró información reciente.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const links: GroundingLink[] = chunks
      .filter((c: any) => c.web)
      .map((c: any) => ({
        uri: c.web.uri,
        title: c.web.title
      }));

    return { text, links };
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return { text: "Error al buscar información en tiempo real.", links: [] };
  }
};

export const getMapsGroundedPlaces = async (query: string, location?: { lat: number; lng: number }): Promise<{ text: string; links: GroundingLink[] }> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `¿Dónde puedo encontrar ${query} en Tarragona?`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: location ? { latitude: location.lat, longitude: location.lng } : { latitude: 41.1189, longitude: 1.2445 }
          }
        }
      },
    });

    const text = response.text || "No pude encontrar lugares cercanos.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const links: GroundingLink[] = chunks
      .filter((c: any) => c.web) // Maps tool usually returns web links in groundingChunks
      .map((c: any) => ({
        uri: c.web.uri,
        title: c.web.title
      }));

    return { text, links };
  } catch (error: any) {
    console.error("Gemini Maps Error:", error);
    if (error.message?.includes("API key")) {
      return { text: "Error de configuración: Clave de API inválida o faltante.", links: [] };
    }
    return { text: "Error al buscar en el mapa. Intenta de nuevo.", links: [] };
  }
};
