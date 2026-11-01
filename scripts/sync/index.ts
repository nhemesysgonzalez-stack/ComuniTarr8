// Robot diario: sincroniza fuentes abiertas de Tarragona con Supabase y limpia lo caducado.
//   npm run sync:all
import { SupabaseClient } from '@supabase/supabase-js';
import { crearCliente, DRY_RUN, hoyMadrid, sumarDias } from './lib';
import { sincronizarEventos } from './eventos';
import { sincronizarTrabajos } from './trabajos';
import { sincronizarCentros } from './centros';

/** Limpieza de lo caducado, incluidas las publicaciones de vecinos ya pasadas. */
async function limpiar(db: SupabaseClient) {
  const hoy = hoyMadrid();
  const hace30 = sumarDias(hoy, -30);
  const pasos: Array<[string, () => PromiseLike<{ error: { message: string } | null }>]> = [
    ['trabajos caducados', () => db.from('trabajos').delete().lt('fecha_caducidad', hoy)],
    ['eventos de vecinos pasados', () => db.from('eventos').delete().eq('fuente', 'vecino')
      .lt('fecha_actividad', hace30).or(`fecha_fin.is.null,fecha_fin.lt.${hace30}`)],
    ['voluntariados pasados', () => db.from('voluntariados').delete().lt('fecha_actividad', hace30)],
  ];
  for (const [nombre, paso] of pasos) {
    const { error } = await paso();
    console.log(error ? `  ⚠ limpieza (${nombre}): ${error.message}` : `  ✓ limpieza: ${nombre}`);
  }
}

async function main() {
  const db = crearCliente();
  console.log(`\n=== Sincronización Tarragona · ${hoyMadrid()} ===`);
  const tareas: Array<[string, (d: SupabaseClient) => Promise<unknown>]> = [
    ['Eventos (Agenda Cultural)', sincronizarEventos],
    ['Trabajos (Feina Activa)', sincronizarTrabajos],
    ['Centros cívicos (OpenStreetMap)', sincronizarCentros],
  ];
  let fallos = 0;
  for (const [nombre, fn] of tareas) {
    console.log(`\n▶ ${nombre}`);
    try { await fn(db); } catch (e) { fallos++; console.error(`  ✗ ${nombre}: ${(e as Error).message}`); }
  }
  console.log('\n▶ Limpieza');
  if (DRY_RUN) console.log('  (omitida en DRY_RUN)'); else await limpiar(db);
  console.log(fallos ? `\nTerminado con ${fallos} fuente(s) fallida(s).` : '\nTerminado sin errores.');
  // Una fuente caída no debe tumbar a las demás, pero sí marcar el workflow en rojo.
  process.exit(fallos ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
