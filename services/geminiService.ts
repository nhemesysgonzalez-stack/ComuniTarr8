
import { GroundingLink } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

/**
 * PLAN C: SIMULADOR DE MEDIADOR VECINAL (Expert Knowledge Base)
 * Responde de forma realista a temas comunes si la IA real falla.
 */
const getSimulatedResponse = (prompt: string, neighborhood: string = 'GENERAL'): string => {
  const p = prompt.toLowerCase();

  // 1. Saludos y Presentación
  if (p.includes("hola") || p.includes("buenos dias") || p.includes("buenas tardes") || p === "mediador" || p === "@mediador") {
    return "¡Hola! Soy tu Mediador Vecinal ⚖️. Estoy aquí para ayudarte a convivir mejor en el barrio y resolver dudas sobre la comunidad. ¿En qué puedo orientarte hoy?";
  }

  // 1.1 Guía de Inicio / Qué se hace
  if (p.includes("que se hace") || p.includes("qué se hace") || p.includes("hace aquí") || p.includes("cómo va") || p.includes("como va") || p.includes("funciona") || p.includes("primera vez")) {
    return "¡Bienvenido/a a ComuniTarr! 🏘️ Es muy sencillo:\n\n• 🏠 INICIO: Lee las noticias del Diari de Tarragona y apoya iniciativas como la de la Rambla.\n• 📍 MAPA: Mira avisos de obras o incidencias en tiempo real.\n• 💬 FORO: Habla con otros vecinos (reales y virtuales) como estás haciendo ahora.\n• 📻 RADIO: Dale al play en el menú lateral para escuchar Tarragona Ràdio.\n• 🏆 XP: Cada vez que participas sumas puntos para el 'Top Vecinos'.\n¿Te ayudo con algo más?";
  }

  // 17. EMPLEO Y MERCADO LABORAL (PRIORIDAD ALTA SI ESTAMOS EN CANAL EMPLEO)
  // Si estamos en el canal de empleo y preguntan algo vago, asumimos empleo, pero NO si preguntan por "limpieza" explícitamente sin 'trabajo'
  const isJobContext = neighborhood === 'EMPLEO';
  if (
    p.includes("trabajo") || p.includes("empleo") || p.includes("laboral") || p.includes("curro") || p.includes("busco") || p.includes("paro") || p.includes("oferta") ||
    (isJobContext && (p.includes("busco") || p.includes("necesito")))
  ) {
    return "Ofertas Laborales Recientes en Tarragona (Enero 2026) 💼:\n\n1. 🧺 Operario/a Lavandería - Constantí (Randstad) → Incorporación inmediata.\n2. � Administrativo/a Logístico - Tarragona Ciudad (Randstad) → Jornada completa.\n3. 📦 Carretillero/a Frontal/Retráctil - Reus (Eurofirms) → Turnos rotativos.\n4. ☕ Ayudante de Camarero/a - Tarragona Centro (Job Today) → Fines de semana.\n5. 🚚 Repartidor Carnet B - Tarragona → Urge contratación.\n6. 🏨 Recepcionista de Noche - Hotel zona Llevant → Inglés alto requerido.\n7. 👵 Cuidador/a de Mayores - Residencia TGN → Turno de tarde.\n\n• Web recomendada: Job Today, Randstad y Eurofirms.";
  }

  // 16. Preppers y Seguridad (Petroquímicas Tarragona) - Prioridad en canal Preppers
  if (neighborhood === 'PREPPERS' || p.includes("prepper") || p.includes("emergencia") || p.includes("petroqu") || p.includes("sirena") || p.includes("kit") || p.includes("evacuac") || p.includes("fuga")) {
    // Si estamos en preppers y no hay keyword específica, damos la intro
    if (neighborhood === 'PREPPERS' && !p.includes("sirena") && !p.includes("kit")) {
      return "Estás en el canal Preppers / TGN Segura 🛡️. Aquí compartimos info sobre:\n\n• Petroquímicas y sirenas (PLASEQTA).\n• Kits de emergencia y primeros auxilios.\n• Puntos de encuentro y evacuación.\n¿Tienes alguna duda de seguridad?";
    }
    return "Canal Preppers / TGN Segura 🛡️:\n\n• Petroquímicas: Tarragona tiene uno de los mayores polígonos petroquímicos de Europa. En caso de sirena, lo habitual es CONFINAMIENTO (cerrar puertas/ventanas).\n• Kit de Emergencia: Agua (6L/persona), linterna, radio a pilas, botiquín, mantas térmicas, copias de documentos.\n• Sirenas: Si suenan 3 veces seguidas = alerta química. Quedarse en casa, cerrar todo, seguir @emergenciescat.\n• Puntos de Encuentro: Cada barrio tiene zonas señalizadas (Francolí, Parque de la Ciudad, Plaza Imperial Tarraco).\n• Botiquín: Gasas, antiséptico, analgésicos, mascarillas FFP2/FFP3, esparadrapo.\n• App recomendada: ALERTA (de Protecció Civil de Catalunya) para recibir avisos en tiempo real.";
  }

  // 2. Basura y Reciclaje
  if (p.includes("basura") || p.includes("reciclaj") || p.includes("contenedor") || p.includes("mueble") || p.includes("punto limpio") || p.includes("deixalleria")) {
    return "Gestión de residuos en TGN ♻️:\n\n• Recogida de voluminosos (muebles/trastos): Gratuita llamando al 977 296 222.\n• Deixalleria Móvil: Consulta los horarios en tu barrio. Si vas a la fija (Polígono Entrevies), puedes obtener bonificaciones en la tasa de la basura de hasta el 50%.\n• Horario orgánica: Obligatorio de 20h a 22h.\n• Contenedores: Recuerda separar (Amarillo: Envases, Azul: Papel, Verde: Vidrio).";
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

  // 7. Noticias y Eventos de Hoy (MIÉRCOLES 28 ENERO 2026 - Sol y Viento)
  if (p.includes("noticia") || p.includes("pasando") || p.includes("hoy") || p.includes("evento") || p.includes("sol") || p.includes("tiempo") || p.includes("lluv") || p.includes("plan")) {
    return "Resumen para el MIÉRCOLES 28 de enero ☀️💨:\n\n• ☀️ TIEMPO: Día soleado y despejado, pero con viento de Mestral (noroeste) moderado. Temp. Máx 16°C.\n• 🌲 RAMBLA: La petición 'Más Verde en la Rambla' ya supera las 850 firmas. ¡Queda poco para el objetivo!\n• 🎬 CULTURA: Ciclo de Cine en V.O. esta tarde a las 18:30h en la Antiga Audiència.\n• 📱 SOCIAL: Taller de ayuda digital para mayores esta mañana en el Centro Cívico de Ponent.\n• 🚗 TRÁFICO: Circulación fluida en los accesos. Sin incidencias por el viento hasta ahora.";
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

  // 15.5 Recomendaciones Puerto Deportivo (Gastronomía)
  if ((p.includes("puerto deportivo") || p.includes("port esportiu")) && (p.includes("cenar") || p.includes("comer") || p.includes("restaurante") || p.includes("recomienda"))) {
    return "Gastronomía en el Puerto Deportivo de Tarragona 🍽️:\n\n• L'Àncora: Un clásico para pescados frescos y arroces con vistas al mar.\n• Rincón de Diego: Alta cocina mediterránea con un toque innovador.\n• El Pescador: Muy buen ambiente y marisco de calidad.\n• La Botiga: Ideal para picar algo o probar sus arroces marineros.\n¡Te recomiendo reservar, sobre todo si es para cenar frente a los barcos!";
  }

  // 16. Ayuda / APP
  if (p.includes("ayuda") || p.includes("funciona") || p.includes("puntos") || p.includes("token") || p.includes("xp")) {
    return "¡Bienvenido a ComuniTarr! 🏘️\nPuedes ganar 'ComuniPoints' y 'Karma (XP)' de varias formas:\n1. Reportando incidencias reales (fotos de baches, luces fundidas...).\n2. Participando en votaciones vecinales.\n3. Ofreciendo o demandando ayuda en el Marketplace.\n4. Interactuando en el foro.\n¡Usa el mapa para ver qué necesitan tus vecinos ahora mismo!";
  }

  // Default
  return "Como tu Mediador Vecinal ⚖️, mi base de conocimientos cubre normativa (LPH), convivencia, limpieza, trámites (OMAC/BASE), agenda cultural tarraconense y más. ¿En qué puedo ayudarte específicamente hoy?";
};

export const getAssistantResponse = async (prompt: string, neighborhood: string = 'GENERAL'): Promise<{ text: string; links?: GroundingLink[] }> => {
  // Siempre intentamos la IA real primero, por si Google decide abrir el grifo
  if (API_KEY) {
    const ATTEMPTS = [
      { model: "gemini-1.5-flash", api: "v1beta" },
      { model: "gemini-1.5-pro", api: "v1beta" }
    ];

    // Incluir contexto del vecindario en el prompt
    const enhancedPrompt = `Estás actuando como el Mediador Vecinal en una app comunitaria de Tarragona llamada ComuniTarr. 
    Actualmente estás respondiendo en el canal/foro: "${neighborhood}".
    
    Tu función es ayudar a los vecinos con información útil, conciliadora y veraz sobre Tarragona, convivencia, limpieza, empleo, etc.
    
    IMPORTANTE:
    - Si el canal es 'EMPLEO', enfócate en oportunidades laborales, formación y consejos de búsqueda de empleo.
    - Si el canal es 'PREPPERS', enfócate en seguridad, emergencias químicas y autoprotección.
    - Si el canal es 'ENCUENTROS', enfócate en socialización y eventos.
    - Si el usuario pregunta algo específico (ej. "limpieza de calles"), responde SOBRE ESE TEMA aunque estés en otro canal, pero puedes mencionar que es un tema general.
    - Responde de forma breve, amable y con iconos.
    
    Usuario pregunta: "${prompt}"`;

    for (const attempt of ATTEMPTS) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/${attempt.api}/models/${attempt.model}:generateContent?key=${API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: enhancedPrompt }] }],
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
      resolve({ text: getSimulatedResponse(prompt, neighborhood) });
    }, 800);
  });
};

export const getSearchGroundedInfo = async (query: string) => ({ text: "No disponible", links: [] });
export const getMapsGroundedPlaces = async (query: string) => ({ text: "No disponible", links: [] });
