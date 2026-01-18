
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

  // 7. Noticias y Eventos de Hoy (DOMINGO 18 ENERO 2026 - Tarde/Noche)
  if (p.includes("noticia") || p.includes("pasando") || p.includes("hoy") || p.includes("evento") || p.includes("sol") || p.includes("tiempo") || p.includes("lluv")) {
    return "Resumen para la tarde-noche del DOMINGO 18 de enero ⛈️:\n\n• ⛈️ TIEMPO: Alerta por lluvias intensas en toda la costa. La lluvia no cesará hasta mañana.\n• 🐎 TRES TOMBS: Los eventos concluyeron con éxito al mediodía antes de la tormenta.\n• ⚠️ TRÁFICO: Calzada muy resbaladiza en el centro y Part Alta. Evita el coche si no es necesario.\n• 💼 MAÑANA: Prepárate para el lunes. El canal de EMPLEO tiene nuevas vacantes para el Puerto de TGN.\n• 🎻 CULTURA: El Teatro Tarragona descansa hoy tras el gran éxito de todo el fin de semana.";
  }

  // 17. EMPLEO Y MERCADO LABORAL
  if (p.includes("trabajo") || p.includes("empleo") || p.includes("laboral") || p.includes("curro") || p.includes("busco") || p.includes("paro")) {
    return "Situación Laboral en Tarragona 💼:\n\n• Canales: Te recomiendo mirar el SOC (Servei d'Ocupació) en la calle Smith o la web de Tarragona Impulsa.\n• Ofertas actuales: Hay mucha demanda de logística en el Puerto y personal de refuerzo en el Hospital Joan XXIII.\n• Hostelería: El Serrallo y el Eixample siempre buscan refuerzos para fin de semana (debes tener el carné de manipulador).\n• Consejos: Sube tu CV a JobToday o InfoJobs filtrando por Tarragona, y mantente atento al canal de EMPLEO de esta App.";
  }

  // 8. Aparcar (Zona Blava / Verda)
  if (p.includes("aparcar") || p.includes("coche") || p.includes("parking") || p.includes("zona azul") || p.includes("zona verde")) {
    return "Aparcamiento en Tarragona 🚗:\n\n• Si eres residente, tienes tarifa súper reducida en zona verde (aprox. 0,40€/día). Debes tramitarlo en la OMAC.\n• Parking Saavedra y Lluís Companys son opciones céntricas si la zona azul está completa.\n• Aplicación: Te recomiendo descargar 'AparcarTGN' para gestionar los tickets desde el móvil.";
  }

  // 9. Nàstic y Tres Tombs
  if (p.includes("nastic") || p.includes("futbol") || p.includes("caballos") || p.includes("tres tombs")) {
    return "¡Actualidad del Barrio! 🐎⚽\n\n• El Nàstic está en semifinales de Copa Catalunya tras la épica del miércoles.\n• Los Tres Tombs del domingo 18 saldrán desde la Rambla Nova. Es el evento más esperado del fin de semana.";
  }

  // 10. Mascotas y Animales
  if (p.includes("perro") || p.includes("gato") || p.includes("mascota") || p.includes("pipican") || p.includes("colonia")) {
    return "Convivencia con animales en TGN 🐾:\n\n• Censo: Es obligatorio inscribir a tu mascota en el registro municipal. Puedes hacerlo en la OMAC.\n• Pipicanes: Hay zonas habilitadas en el Parque de la Ciudad, Francolí y varios barrios. ¡Recuerda recoger siempre los excrementos!\n• Playas: En temporada baja pueden ir a la playa, pero del 1 de abril al 15 de octubre solo está permitido en la zona habilitada de la Playa del Miracle.";
  }

  // 11. Limpieza de Calles (Plà de Xoc)
  if (p.includes("sucio") || p.includes("limp") || p.includes("nevera") || p.includes("calle") || p.includes("mancha")) {
    return "Sobre la limpieza del barrio 🧹:\n\n• El Ayuntamiento tiene activo el 'Plà de Xoc' de limpieza intensiva. Si ves una mancha o residuo persistente, repórtalo en esta app o llama al Teléfono del Verde (977 296 222).\n• Recuerda que dejar muebles fuera del día de recogida conlleva multas de hasta 300€.";
  }

  // 12. Sanidad y Salud (CAP)
  if (p.includes("medico") || p.includes("cap") || p.includes("urgen") || p.includes("farmacia") || p.includes("hospital")) {
    return "Información sanitaria en Tarragona 🏥:\n\n• Urgencias: Tienes el Hospital Joan XXIII (centro público) y el Hospital de Santa Tecla (centro céntrico).\n• CAP: Para tu cita previa, usa la app 'La Meva Salut' o llama al 93 326 89 01.\n• Farmacias de guardia: Puedes consultar la farmacia abierta hoy en el listado oficial del Colegio de Farmacéuticos (COFT).";
  }

  // 13. Impuestos y Facturas (IBI/BASE)
  if (p.includes("impuesto") || p.includes("ibi") || p.includes("base") || p.includes("multa") || p.includes("pagar")) {
    return "Gestión de tributos 💰:\n\n• El IBI y otras tasas municipales en Tarragona se gestionan a través de BASE (Diputació de Tarragona).\n• Oficina: Calle de l'Assalt, 12. Es mejor pedir cita previa online.\n• Bonificaciones: Los edificios con placas solares o familias numerosas pueden pedir descuentos en el IBI.";
  }

  // 14. Gente Mayor y Ayuda a Domicilio
  if (p.includes("mayor") || p.includes("abuelo") || p.includes("teleasistencia") || p.includes("soledad") || p.includes("ayuda a domicilio")) {
    return "Apoyo a nuestros mayores 👵👴:\n\n• Teleasistencia: El Ayuntamiento ofrece un servicio de botón rojo para emergencias en casa. Consúltalo en Servicios Sociales.\n• Centros de Día: Hay centros municipales en casi todos los barrios (Tarragona II, Sant Salvador, etc.) con actividades dinámicas.\n• Acompañamiento: Varias asociaciones como Cruz Roja TGN tienen programas contra la soledad no deseada.";
  }

  // 15. Seguridad y Denuncias
  if (p.includes("seguridad") || p.includes("robar") || p.includes("policia") || p.includes("guardia urbana") || p.includes("mossos")) {
    return "Seguridad ciudadana 🚓:\n\n• Emergencias: Llama siempre al 112.\n• Denuncias: Para cosas menores, puedes ir a la comisaría de la Guardia Urbana (C/ Arquebisbe Pont i Gol) o a Mossos (Campo Claro).\n• Consejos: Especial atención en zonas turísticas como la Catedral o el Anfiteatro para evitar hurtos.";
  }

  // 16. Ayuda / APP
  if (p.includes("ayuda") || p.includes("funciona") || p.includes("puntos") || p.includes("token") || p.includes("xp")) {
    return "¡Bienvenido a ComuniTarr! 🏘️\nPuedes ganar 'ComuniPoints' y 'Karma (XP)' de varias formas:\n1. Reportando incidencias reales (fotos de baches, luces fundidas...).\n2. Participando en votaciones vecinales.\n3. Ofreciendo o demandando ayuda en el Marketplace.\n4. Interactuando en el foro.\n¡Usa el mapa para ver qué necesitan tus vecinos ahora mismo!";
  }

  // Default
  return "Como tu Mediador Vecinal ⚖️, mi base de conocimientos cubre normativa (LPH), convivencia, limpieza, trámites (OMAC/BASE), agenda cultural tarraconense y más. ¿En qué puedo ayudarte específicamente hoy?";
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
