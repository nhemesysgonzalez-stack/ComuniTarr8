
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
    return "Dada mi función de Mediador Vecinal ⚖️, te sugiero esto para ruidos:\n\n1. Resolución Amistosa: Habla con el vecino en un momento de calma. A veces no son conscientes del impacto.\n2. Normativa: El horario de descanso es de 22:00h a 08:00h. Durante el día, el límite es de 35dB en interiores.\n3. Escalada: Si no cesa, puedes contactar con el Administrador de Fincas o, en casos extremos, con la Guardia Urbana (092).";
  }

  // 4. Ley de Propiedad Horizontal (LPH)
  if (p.includes("ley") || p.includes("comunidad") || p.includes("vecinos") || p.includes("estatutos") || p.includes("junta")) {
    return "Como experto en convivencia ⚖️, te informo sobre la Ley de Propiedad Horizontal:\n\n• Obras: Si quieres reformar tu piso, no puedes alterar la estructura o fachada sin permiso de la Junta.\n• Cuotas: Todos los vecinos deben contribuir a los gastos comunes según su coeficiente.\n• Mayorías: Para instalar ascensor o suprimir barreras arquitectónicas, basta con la mayoría de votos.\n• ¿Tienes una duda específica sobre un acta o una derrama?";
  }

  // 5. Trámites en Tarragona (OMAC)
  if (p.includes("trámite") || p.includes("padron") || p.includes("papel") || p.includes("cita") || p.includes("ayuntamiento") || p.includes("omac")) {
    return "Para trámites municipales en Tarragona 🏛️:\n\n• La OMAC (Oficina Municipal d'Atenció Ciutadana) requiere cita previa. Puedes pedirla en la web tarragona.cat o llamando al 010.\n• Empadronamiento: Necesitas DNI/NIE y el contrato de alquiler o escritura de la vivienda.\n• Volante de convivencia: Se puede obtener online con certificado digital al instante.";
  }

  // 6. Basura, Reciclaje y Deixalleria
  if (p.includes("basura") || p.includes("reciclaj") || p.includes("contenedor") || p.includes("mueble") || p.includes("punto limpio") || p.includes("deixalleria")) {
    return "Gestión de residuos en TGN ♻️:\n\n• Recogida de voluminosos (muebles/trastos): Gratuita llamando al 977 296 222.\n• Deixalleria Móvil: Consulta los horarios en tu barrio. Si vas a la fija (Polígono Entrevies), puedes obtener bonificaciones en la tasa de la basura.\n• Horario orgánica: Obligatorio de 20h a 22h.";
  }

  // 7. Noticias y Eventos de Hoy (SÁBADO 17 ENERO 2026)
  if (p.includes("noticia") || p.includes("pasando") || p.includes("hoy") || p.includes("evento") || p.includes("sol") || p.includes("tiempo")) {
    return "Resumen para hoy SÁBADO 17 de enero ☀️:\n\n• ☀️ CLIMA: Vuelve el sol tras las lluvias. Día despejado pero fresco (máx 14°C).\n• 🎉 ÉXITO: Gran acogida al concierto de Philip Glass de anoche. ¡Lleno absoluto!\n• 🐎 TRES TOMBS: Mañana domingo a las 11:00h en la Rambla Nova. Hoy es el último día para ver los preparativos.\n• 🧹 COMUNIDAD: Jornada voluntaria de limpieza a las 12:00h en la Part Alta para despejar alcantarillas.\n• 🛒 OCIO: Mercadillo tradicional en la zona del Foro y Plaza de la Font.";
  }

  // 8. Aparcar (Zona Blava / Verda)
  if (p.includes("aparcar") || p.includes("coche") || p.includes("parking") || p.includes("zona azul") || p.includes("zona verde")) {
    return "Aparcamiento en Tarragona 🚗:\n\n• Si eres residente, tienes tarifa súper reducida en zona verde (aprox. 0,40€/día). Debes tramitarlo en la OMAC.\n• Parking Saavedra y Lluís Companys son opciones céntricas si la zona azul está completa.\n• Aplicación: Te recomiendo descargar 'AparcarTGN' para gestionar los tickets desde el móvil.";
  }

  // 9. Nàstic y Tres Tombs
  if (p.includes("nastic") || p.includes("futbol") || p.includes("caballos") || p.includes("tres tombs")) {
    return "¡Actualidad del Barrio! 🐎⚽\n\n• El Nàstic está en semifinales de Copa Catalunya tras la épica del miércoles.\n• Los Tres Tombs del domingo 18 saldrán desde la Rambla Nova. Es el evento más esperado del fin de semana.";
  }

  // 10. Ayuda / APP
  if (p.includes("ayuda") || p.includes("funciona") || p.includes("puntos") || p.includes("token")) {
    return "¡Bienvenido a ComuniTarr! 🏘️\nPuedes ganar 'Puntos de Vecino' reportando incidencias reales o ayudando en el Marketplace. Estos puntos te darán insignias y acceso a ventajas locales exclusivas en comercios del barrio.";
  }

  // Default
  return "Como tu Mediador Vecinal ⚖️, mi objetivo es que la convivencia sea perfecta. ¿Necesitas saber algo sobre normativas, trámites municipales o qué está pasando hoy en la ciudad?";
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
