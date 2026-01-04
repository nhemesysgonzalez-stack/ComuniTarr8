
import { safeSupabaseInsert } from './services/dataHandler';

const seedNews = async () => {
    const newsItem = {
        title: "❄️ ALERTA: Nieve y Frío Intenso en Tarragona",
        content: "Protección Civil activa la alerta por nevadas en cotas bajas a partir de mañana. Se recomienda adelantar el regreso de las vacaciones para evitar colapsos en la AP-7 y carreteras secundarias ante la víspera de Reyes.",
        category: "URGENTE",
        neighborhood: "GENERAL",
        author_name: "Protección Civil",
        itinerary: "• Cota de nieve bajando a 200-400 metros.\n• Riesgo alto en zonas del prelitoral y comarcas del interior.\n• Consejo: Llenar el depósito de combustible y revisar batería.\n• Atención a la formación de placas de hielo en zonas sombrías.\n• Consultar estado de carreteras en @transit.",
        link_url: "https://interior.gencat.cat/ca/arees_dactuacio/proteccio_civil/",
        expires_at: "2026-01-06T23:59:59Z",
        created_at: new Date().toISOString()
    };

    try {
        const { success, isLocal } = await safeSupabaseInsert('announcements', newsItem);
        if (success) {
            console.log(isLocal ? "✅ Noticia guardada LOCALMENTE (Modo Demo)" : "✅ Noticia publicada en SUPABASE");
        }
    } catch (e) {
        console.error("❌ Error al publicar la noticia:", e);
    }
};

seedNews();
