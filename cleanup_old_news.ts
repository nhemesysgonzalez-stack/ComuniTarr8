
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanup() {
    console.log("🚀 Iniciando limpieza profunda de base de datos...");

    // 1. Eliminar anuncios específicos
    await supabase
        .from('announcements')
        .delete()
        .or('title.ilike.%Perez Michel%,content.ilike.%Perez Michel%,title.ilike.%Nuevo Vecino%');
    console.log("✅ Anuncios de 'Nuevo Vecino' eliminados.");

    // 2. Eliminar mensajes del FORO que hablen de LLUVIA o TRES TOMBS (antiguos)
    const { error: fError } = await supabase
        .from('forum_messages')
        .delete()
        .or('content.ilike.%Tres Tombs%');

    if (fError) console.error("❌ Error eliminando mensajes de lluvia:", fError);
    else console.log("✅ Mensajes antiguos de lluvia eliminados del foro.");

    // 3. Eliminar noticias antiguas (más de 3 días para el foro, queremos frescura)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    await supabase
        .from('forum_messages')
        .delete()
        .lt('created_at', threeDaysAgo.toISOString());
    console.log("✅ Mensajes del foro antiguos (3 días) eliminados.");

    // 4. Eliminar eventos pasados
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await supabase
        .from('events')
        .delete()
        .lt('event_date', yesterday.toISOString().split('T')[0]);
    console.log("✅ Eventos pasados eliminados.");
}

cleanup();
