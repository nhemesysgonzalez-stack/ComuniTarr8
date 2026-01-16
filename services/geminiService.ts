
import { GroundingLink } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

/**
 * PLAN C: SIMULADOR DE MEDIADOR VECINAL (Expert Knowledge Base)
 * Responde de forma realista a temas comunes si la IA real falla.
 */
const getSimulatedResponse = (prompt: string): string => {
  const p = prompt.toLowerCase();

  // 1. Saludos
  if (p.includes("hola") || p.includes("buenos dias") || p.includes("buenas tardes")) {
    return "¡Hola! Soy tu Mediador Vecinal 🤝. Estoy aquí para ayudarte a convivir mejor en el barrio y resolver dudas sobre la comunidad. ¿En qué puedo orientarte hoy?";
  }

  // 2. Basura y Reciclaje
  if (p.includes("basura") || p.includes("reciclaj") || p.includes("contenedor")) {
    return "Sobre la gestión de residuos ♻️:\n\n• Recuerda que el horario para bajar la basura orgánica es de 20:00h a 22:00h.\n• Los contenedores de reciclaje (papel, vidrio, plástico) están disponibles 24h.\n• Para muebles y trastos viejos, el Ayuntamiento tiene un servicio de recogida gratuita. Llama al 010 para consultar tu día según el barrio.";
  }

  // 3. Ruidos y Convivencia
  if (p.includes("ruido") || p.includes("fiesta") || p.includes("musica") || p.includes("molestia")) {
    return "Dada mi función de Mediador Vecinal ⚖️, te sugiero esto para ruidos:\n\n1. Intenta hablar primero con el vecino de forma amistosa; a veces no son conscientes del volumen.\n2. La normativa municipal establece el descanso de 22:00h a 08:00h.\n3. Si la situación es recurrente o grave, puedes reportarlo en la sección de 'Incidencias' de nuestra app para que la comunidad tome nota.";
  }

  // 4. Noticias de Hoy (VIERNES 16 ENERO 2026)
  if (p.includes("noticia") || p.includes("pasando") || p.includes("hoy") || p.includes("evento")) {
    return "Lo más relevante hoy Viernes 16 de enero en Tarragona 📍:\n\n• 🌧️ TENEMOS ALERTA POR LLUVIA a partir de la tarde. Tenlo en cuenta para tus planes en el exterior.\n• 🎻 Esta noche hay concierto de Philip Glass en el Teatre Tarragona (20:30h).\n• 🐎 Solo quedan 2 días para Els Tres Tombs. El domingo será el gran desfile.\n• ⚽ Seguimos celebrando el pase a semis del Nàstic del pasado miércoles.";
  }

  // 5. Nàstic
  if (p.includes("nastic") || p.includes("futbol")) {
    return "¡Orgullo Grana! ❤️🤍 El Nàstic se clasificó para las semifinales de la Copa Catalunya el pasado miércoles tras ganar a la Montañesa. El equipo está en un gran momento y la ciudad está volcada con ellos.";
  }

  // 6. Tres Tombs
  if (p.includes("tres tombs") || p.includes("caballos") || p.includes("domingo")) {
    return "Sobre Els Tres Tombs 🐎:\n\nSe celebra este domingo 18 de enero. Es una tradición preciosa en honor a Sant Antoni Abat. Habrá un desfile de carruajes y bendición de animales en la Rambla Nova. ¡No te lo pierdas!";
  }

  // 7. Lluvia / Tiempo
  if (p.includes("tiempo") || p.includes("lluvia") || p.includes("clima")) {
    return "Previsión para hoy ☁️: Se espera un cambio de tiempo. Por la tarde es muy probable que empiece a llover de forma débil/moderada en Tarragona. Las temperaturas se mantienen frescas, entre 11°C y 15°C.";
  }

  // 8. Ayuda / APP
  if (p.includes("ayuda") || p.includes("funciona") || p.includes("puntos")) {
    return "En ComuniTarr puedes ganar puntos (CP) colaborando: reporta incidencias, ayuda a vecinos en el Marketplace o participa en el foro. Cuanto más colabores, más nivel de 'Buen Vecino' tendrás 🏆.";
  }

  // Default
  return "Como tu Mediador Vecinal 🤝, me gustaría darte una respuesta precisa. ¿Podrías darme más detalles o preguntarme sobre la convivencia, las noticias de hoy o los servicios del barrio?";
};

export const getAssistantResponse = async (prompt: string): Promise<{ text: string; links?: GroundingLink[] }> => {
  // Siempre intentamos la IA real primero, por si Google decide abrir el grifo
  if (API_KEY) {
    const ATTEMPTS = [
      { model: "gemini-1.5-flash", api: "v1beta" },
      { model: "gemini-1.5-pro", api: "v1beta" }
    ];

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
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return { text: data.candidates[0].content.parts[0].text };
        }
      } catch (e) {
        // Fallback al siguiente modelo o al simulador
      }
    }
  }

  // SI FALLA TODO (Quota 0), ACTIVAMOS EL PLAN C: MEDIADOR VECINAL
  return new Promise((resolve) => {
    // Simulamos un pequeño retraso para que parezca que la IA está "pensando"
    setTimeout(() => {
      resolve({ text: getSimulatedResponse(prompt) });
    }, 800);
  });
};

export const getSearchGroundedInfo = async (query: string) => ({ text: "No disponible", links: [] });
export const getMapsGroundedPlaces = async (query: string) => ({ text: "No disponible", links: [] });
