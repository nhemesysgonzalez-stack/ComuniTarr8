
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const seedNews = async () => {
    const newsItem = {
        title: "🌧️ ALERTA: Martes de Lluvia en Tarragona",
        content: "Se registran lluvias débiles y cielos cubiertos en toda la costa. Protección Civil recomienda precaución por pavimentos resbaladizos, especialmente en la Part Alta y accesos al Puerto. La visibilidad puede ser reducida en carretera.",
        category: "ALERTA",
        neighborhood: "GENERAL",
        author_name: "Protección Civil TGN",
        itinerary: "• Martes Mañana: Lluvia ligera continua.\n• Martes Tarde: Chubascos aislados.\n• Miércoles: Cielos muy nubosos pero tendencia a despejar.\n• Recomendación: Moderar la velocidad al conducir.",
        link_url: "https://www.tarragona.cat/emergencies",
        expires_at: "2026-01-22T23:59:59Z",
        created_at: new Date().toISOString()
    };

    try {
        const { error } = await supabase.from('announcements').insert([newsItem]);
        if (error) throw error;
        console.log("✅ Noticia de LLUVIA publicada en SUPABASE");
    } catch (e) {
        console.error("❌ Error al publicar la noticia:", e);
    }
};

seedNews();
