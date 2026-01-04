
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env file");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const seedPolls = async () => {
    const pollItem = {
        title: "🏆 Votación: Bona Gent de Tarragona 2025",
        options: [
            "Asier y Hugo Estébanez (Deporte/Pádel)",
            "David Diestre (Joven Talento/Física)",
            "Carolina Gómez (Solidaridad/Madre Coraje)",
            "Santos Masegosa (Cultura/Gastronomía)",
            "Bombers de la Generalitat (Servicios)",
            "Nens del Vendrell (Castells Solidarios)"
        ],
        neighborhood: "GENERAL",
        creator_id: null // System created
    };

    console.log("🚀 Iniciando publicación de votación...");

    try {
        const { error } = await supabase.from('polls').insert([pollItem]);
        if (error) {
            console.error("❌ Error al insertar en Supabase:", error);
        } else {
            console.log("✅ Votación 'Bona Gent 2025' publicada en Supabase con éxito.");
        }
    } catch (e) {
        console.error("❌ Error inesperado durante el seeding:", e);
    }
};

seedPolls();
