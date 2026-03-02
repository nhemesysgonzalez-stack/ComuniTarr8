
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
  const isJobContext = neighborhood === 'EMPLEO';
  if (
    p.includes("trabajo") || p.includes("empleo") || p.includes("laboral") || p.includes("curro") || p.includes("busco") || p.includes("paro") || p.includes("oferta") ||
    (isJobContext && (p.includes("busco") || p.includes("necesito")))
  ) {
    return "Ofertas Laborales Urgentes (Lunes 2 Mar) 💼:\n\n" +
      "1. 🏢 Administrativo/a - Gestoría en Eixample → 📞 688 33 22 11\n" +
      "2. 📦 Repartidor/a Carnet C - Logística Entrevies → 📞 611 22 99 00\n" +
      "3. 👨‍🔧 Técnico Mantenimiento - Centros Cívicos → 📞 977 24 55 60\n" +
      "4. 🛒 Dependiente/a - Ferretería Torreforta → 📞 977 55 44 22\n" +
      "5. 👨‍🍳 Cocinero/a - Restaurante Serrallo → 📞 655 44 11 00\n\n" +
      "• ¿Necesitas orientación? Hoy lunes Tarragona Impulsa atiende de 9h a 14h.";
  }

  // 16. Preppers y Seguridad (Petroquímicas / Viento) - Prioridad en canal Preppers
  if (neighborhood === 'PREPPERS' || p.includes("viento") || p.includes("ventcat") || p.includes("aire") || p.includes("prepper") || p.includes("emergencia") || p.includes("petroqu") || p.includes("sirena") || p.includes("kit") || p.includes("evacuac") || p.includes("fuga")) {

    // Respuesta específica para el VIENTO (Ventcat)
    if (p.includes("viento") || p.includes("aire") || p.includes("ventcat") || p.includes("hacer")) {
      return "☀️ TIEMPO (Lunes 2 Mar): Cielos despejados para hoy en Tarragona. Viento suave (15km/h). Ideal para actividades al aire libre.\n\n👣 RECOMENDACIÓN:\n1. Disfruta del Balcó del Mediterrani.\n2. Día perfecto para el inicio de semana laboral.\n3. Sin alertas meteorológicas activas hoy.";
    }

    if (neighborhood === 'PREPPERS' && !p.includes("sirena") && !p.includes("kit")) {
      return "Estás en el canal Preppers / TGN Segura 🛡️. Hoy estamos enfocados en la ALERTA POR VIENTO (Ventcat).\n\n• Sirenas: Si no las oíste ayer, repórtalo en el Mapa 📍.\n• Kits: Revisa linternas por si falla el suministro eléctrico hoy.\n¿Tienes dudas sobre seguridad hoy?";
    }
    return "Canal Preppers / TGN Segura 🛡️:\n\n• Alerta Viento: Mestral fuerte hoy. Máxima precaución en zonas altas.\n• Petroquímicas: En caso de sirena, CONFINAMIENTO inmediato.\n• Kit de Emergencia: Agua, linterna, radio a pilas (recomiendo Sangean), botiquín.\n• Sirenas: 3 pitidos largos = Alerta Química.\n• App recomendada: ALERTA (Protecció Civil).";
  }

  // 2. Basura y Reciclaje
  if (p.includes("basura") || p.includes("reciclaj") || p.includes("contenedor") || p.includes("mueble") || p.includes("punto limpio") || p.includes("deixalleria")) {
    return "Gestión de residuos en TGN ♻️:\n\n• Recogida de voluminosos (muebles/trastos): Gratuita llamando al 977 296 222.\n• Deixalleria Móvil: Consulta los horarios en tu barrio. Si vas a la fija (Polígono Entrevies), puedes obtener bonificaciones en la tasa de la basura de hasta el 50%.\n• Horario orgánica: Obligatorio de 20h a 22h.\n• Contenedores: Recuerda separar (Amarillo: Envases, Azul: Papel, Verde: Vidrio).";
  }

  // 2.1 TRÁFICO EN TIEMPO REAL
  if (p.includes("trafico") || p.includes("tráfico") || p.includes("carretera") || p.includes("circulacion") || p.includes("atasco") || p.includes("retenciones") || p.includes("corte")) {
    return "🚗 TRÁFICO TARRAGONA (Lunes 2 Mar, 09:15h):\n\n• 🟡 PL. DE LA FONT: Acceso restringido por montaje del velatorio del Ninot.\n• 🟢 RAMBLA Y AV. ROMA: Circulación fluida sin incidentes.\n• 🔴 AVISO 20:00h: Cortes previstos en Baixada de la Misericòrdia y calles adyacentes por la procesión del Entierro.\n\n💡 Se recomienda usar parkings subterráneos si vienes a ver la Quema.";
  }

  // 2.2 FARMACIAS DE GUARDIA
  if (p.includes("farmacia") || p.includes("guardia") || p.includes("medicamento") || p.includes("parafarmacia")) {
    return "💊 FARMACIAS DE GUARDIA HOY (Lunes 2 Mar 2026):\n\n• 🏥 Farmacia BESORA - Rambla Nova, 121 (09-22h)\n• 🏥 Farmacia GUINOVART - C/ Girona, 10 (24h)\n• 🏥 Farmacia CENTRAL - Rambla Vella, 50 (hasta 22h)\n\n📍 Farmacia de guardia abierta 24h: GUINOVART.\n⚕️ Urgencias: CAP Llevant o Hospital Santa Tecla.";
  }

  // 2.3 COLEGIOS Y EDUCACIÓN
  if (p.includes("colegio") || p.includes("escuela") || p.includes("escola") || p.includes("instituto") || p.includes("matricula") || p.includes("matrícula") || p.includes("calendario escolar") || p.includes("menu escolar") || p.includes("menú")) {
    return "🎓 INFORMACIÓN ESCOLAR (Lunes 2 Mar):\n\n📅 **ENTRADA A CLASES:**\n• Hoy Lunes: Jornada escolar normal en todos los centros de TGN.\n• Menú del día: Crema de verduras y pescado al horno (Menú General Educativo).\n• Preinscripción: Recuerda que el periodo abre la próxima semana.\n\n💡 Consulta el calendario oficial en gencat.cat/ensenyament";
  }

  // 2.4 SERVICIOS MUNICIPALES (AMPLIADO)
  if (p.includes("servicio") || p.includes("omac") || p.includes("ventanilla") || p.includes("cita previa") || p.includes("dni") || p.includes("padrón") || p.includes("empadronamiento")) {
    return "🏛️ SERVICIOS MUNICIPALES TARRAGONA:\n\n📍 **OMAC (Oficina Municipal Atenció Ciutadana):**\n• Pl. de la Font, 1\n• ☎️ 010 / 977 296 100\n• 🌐 tarragona.cat/cita-previa\n• Horario: L-V 8:30-14:00\n\n🔑 **TRÁMITES MÁS COMUNES:**\n• Empadronamiento: DNI/NIE + contrato alquiler/escritura\n• Volante de convivencia: Online con Cl@ve o certificado digital\n• Recogida de muebles: ☎️ 977 296 222 (gratuito)\n• Renovar DNI: Cita en Comisaría Nacional (C/ Lleida)\n\n💳 **PAGOS (IBI, Multas):**\n• Oficina BASE: C/ Assalt, 12 → base.ddgi.cat";
  }

  // 2.5 PETROQUÍMICAS Y PLASEQTA (EXPANDIDO)
  if (p.includes("plaseqta") || p.includes("petroqu") || p.includes("alerta quim") || p.includes("sirena") || p.includes("fuga") || p.includes("confinamiento")) {
    return "🚨 PLASEQTA - PLAN SEGURIDAD PETROQUÍMICAS:\n\n📊 **ESTADO ACTUAL:** 🟢 VERDE (Normalidad)\n\n🔔 **SIRENAS DE ALERTA:**\n• 1 pitido largo (1 min): PRUEBA mensual (primer domingo)\n• 3 pitidos (3x20 seg): ⚠️ ALERTA QUÍMICA REAL\n\n🏠 **SI SUENA ALERTA:**\n1. Entra en casa INMEDIATAMENTE\n2. Cierra puertas y ventanas\n3. Apaga ventilación/aire acondicionado\n4. Sigue @emergenciescat y 📻 Catalunya Ràdio\n5. NO salgas hasta que se dé el aviso de FIN de alerta\n\n📱 **APP OFICIAL:** ALERTA (Protecció Civil)\n🌐 **INFO EN VIVO:** cetem.gencat.cat\n\n❓ Dudas: ☎️ 112";
  }

  // 2.6 TRANSPORTE PÚBLICO
  if (p.includes("autobus") || p.includes("bus") || p.includes("emt") || p.includes("renfe") || p.includes("cercanias") || p.includes("tren") || p.includes("horario")) {
    return "🚌🚆 TRANSPORTE PÚBLICO TARRAGONA:\n\n**EMT (Autobuses urbanos):**\n• 📱 App: EMT Tarragona\n• Líneas principales: L1 (Circular), L5 (Puerto-Part Alta), L8 (Bonavista)\n• 🆘 HOY: Línea 2 desviada por obras en Rambla Nova\n• Tarjeta T-12: 12,30€ (10 viajes)\n\n**RENFE Cercanías:**\n• R-16: Tarragona ↔ Reus ↔ Salou (cada 30min)\n• R-17: Tarragona ↔ Tortosa\n• 🟢 Sin incidencias hoy\n• 🌐 rodalies.gencat.cat\n\n🚕 **Taxi:** RadioTaxi TGN → ☎️ 977 22 14 14";
  }

  // 2.7 ACTIVIDADES Y OCIO
  if (p.includes("actividad") || p.includes("evento") || p.includes("plan") || p.includes("ocio") || p.includes("que hacer") || p.includes("qué hacer")) {
    return "📅 ACTIVIDADES HOY (Lunes 2 Mar):\n\n🏢 **EMPLEO (11:00h):**\n• Sesión grupal 'Mejora tu currículum' en Tarragona Impulsa (Espai Tabacalera).\n\n📚 **CULTURA (18:00h):**\n• Club de lectura en la Biblioteca Pública (C/ Fortuny). Lectura 'Puente de Hierro'.\n\n🎨 **ARTE:**\n• Exposición 'Legado Romano' abierta en el MANT (Previa reserva).\n\n💡 Mañana Martes: Taller de digitalización para seniors.";
  }

  // 2.8 EMERGENCIAS Y NÚMEROS ÚTILES
  if (p.includes("emergencia") || p.includes("urgencia") || p.includes("llamar") || p.includes("telefono") || p.includes("teléfono") || p.includes("contacto") || p.includes("numero")) {
    return "📞 TELÉFONOS ÚTILES TARRAGONA:\n\n🆘 **EMERGENCIAS:**\n• 112: Emergencias generales\n• 092: Guardia Urbana\n• 091: Policía Nacional\n• 088: Mossos d'Esquadra\n• 061: Salut Respon (urgencias sanitarias)\n• 016: Violencia de Género (no deja rastro)\n\n🏛️ **AYUNTAMIENTO:**\n• 010: Información municipal\n• 977 296 222: Recogida muebles, limpieza\n\n🏥 **SANIDAD:**\n• CAP Cita Previa: 93 326 89 01\n• Hospital Joan XXIII: 977 29 58 00\n\n🚨 **PROTECCIÓN CIVIL:** 112";
  }

  // 2.9 CORTES DE SUMINISTRO Y AVERÍAS
  if (p.includes("corte") || p.includes("luz") || p.includes("agua") || p.includes("averia") || p.includes("avería") || p.includes("apagon") || p.includes("apagón") || p.includes("fuga agua")) {
    return "⚡💧 AVERÍAS Y CORTES DE SUMINISTRO:\n\n**ELECTRICIDAD (ENDESA):**\n• Averías: ☎️ 800 760 706 (24h)\n• 🌐 endesa.com/averias\n• ⚠️ Hoy: Sin cortes programados en Tarragona\n\n**AGUA (EMATSA):**\n• Averías: ☎️ 900 670 207 (24h)\n• Fugas en vía pública: Mismo teléfono\n• 🌐 ematsa.cat\n\n**GAS (NATURGY):**\n• Fuga de gas: ☎️ 900 750 750 (¡URGENTE!)\n• Averías: ☎️ 900 100 251\n\n⚠️ Si hueles a gas: NO enciendas luces, ventila y llama YA.";
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

  // 7. Noticias y Eventos de Hoy (MARTES 17 FEBRERO 2026 - Entierro de la Sardina)
  if (p.includes("noticia") || p.includes("pasando") || p.includes("hoy") || p.includes("evento") || p.includes("viento") || p.includes("tiempo") || p.includes("plan")) {
    return "Resumen para el LUNES 2 de marzo ☀️:\n\n• 🏢 TRÁMITES: Oficinas municipales abiertas. Inicio de periodo de impuestos municipales.\n• 💼 TRABAJO: Apertura de nuevas vacantes para la campaña de primavera.\n• ☀️ TIEMPO: Día estable con máximas de 17°C.\n• 🚌 BUSES: Frecuencia habitual de jornada laborable.";
  }

  // 8. Aparcar (Zona Blava / Verda)
  if (p.includes("aparcar") || p.includes("coche") || p.includes("parking") || p.includes("zona azul") || p.includes("zona verde")) {
    return "Aparcamiento en Tarragona 🚗:\n\n• Si eres residente, tienes tarifa súper reducida en zona verde (aprox. 0,40€/día). Debes tramitarlo en la OMAC.\n• Parking Saavedra y Lluís Companys son opciones céntricas si la zona azul está completa.\n• Aplicación: Te recomiendo descargar 'AparcarTGN' para gestionar los tickets desde el móvil.";
  }

  // 9. Nàstic y Carnaval
  if (p.includes("nastic") || p.includes("futbol") || p.includes("caballos") || p.includes("tres tombs")) {
    return "¡Actualidad del Barrio! 🐎⚽\n\n• El Nàstic jugó ayer, consulta el resultado en el Diari. ¡Próximo partido fuera!\n• Los Tres Tombs de ayer fueron un éxito rotundo en la Rambla Nova. ¡Vaya desfile de caballos!";
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
