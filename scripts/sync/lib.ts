// Utilidades comunes del robot de sincronización (se ejecuta en GitHub Actions o en local).
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const USER_AGENT = 'ComuniTarr-sync/1.0 (https://github.com/nhemesysgonzalez-stack/ComuniTarr8)';

export const DRY_RUN = process.env.DRY_RUN === '1';

export function crearCliente(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'http://dry-run.invalid';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || (DRY_RUN ? 'dry-run' : undefined);
  if (!url || !key) {
    throw new Error('Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY (secretos del repositorio en GitHub).');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Fecha de hoy (YYYY-MM-DD) en horario de Madrid, no en UTC. */
export function hoyMadrid(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date());
}

export function sumarDias(iso: string, dias: number): string {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

export async function fetchConReintentos(url: string, init: RequestInit = {}, intentos = 3): Promise<Response> {
  let ultimoError: unknown;
  for (let i = 1; i <= intentos; i++) {
    try {
      const res = await fetch(url, {
        ...init,
        headers: { 'User-Agent': USER_AGENT, Accept: '*/*', ...(init.headers || {}) },
        signal: AbortSignal.timeout(120_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
      return res;
    } catch (e) {
      ultimoError = e;
      console.warn(`  intento ${i}/${intentos} falló: ${(e as Error).message}`);
      await new Promise(r => setTimeout(r, 2000 * i));
    }
  }
  throw ultimoError;
}

/** Limpia teléfonos: devuelve "977 29 61 00" o null si no parece un teléfono español válido. */
export function limpiarTelefono(valor?: string | null): string | null {
  if (!valor) return null;
  const primero = String(valor).split(/[;,/]/)[0];
  let digitos = primero.replace(/\D/g, '');
  if (digitos.startsWith('0034')) digitos = digitos.slice(4);
  else if (digitos.startsWith('34') && digitos.length === 11) digitos = digitos.slice(2);
  if (!/^[6789]\d{8}$/.test(digitos)) return null;
  return `${digitos.slice(0, 3)} ${digitos.slice(3, 5)} ${digitos.slice(5, 7)} ${digitos.slice(7)}`;
}

export function recortar(texto: string | undefined | null, max: number): string | null {
  if (!texto) return null;
  const limpio = String(texto).replace(/\s+/g, ' ').trim();
  if (!limpio) return null;
  return limpio.length > max ? limpio.slice(0, max - 1).trimEnd() + '…' : limpio;
}

/**
 * Sustituye los datos de una fuente: hace upsert del lote y borra lo que ya no está en el feed
 * (eventos pasados, ofertas retiradas, datos de ejemplo antiguos de esa misma fuente).
 */
export async function reemplazarFuente(
  db: SupabaseClient,
  tabla: string,
  fuente: string,
  filas: Record<string, unknown>[],
): Promise<{ insertadas: number; borradas: number }> {
  if (filas.length === 0) {
    throw new Error(`La fuente "${fuente}" devolvió 0 filas: se aborta para no vaciar la tabla ${tabla}.`);
  }
  if (DRY_RUN) {
    console.log(`  [DRY_RUN] ${tabla}: ${filas.length} filas. Muestra:`);
    console.log(JSON.stringify(filas.slice(0, 3), null, 2));
    const porBarrio: Record<string, number> = {};
    filas.forEach(f => { const b = String(f.barrio); porBarrio[b] = (porBarrio[b] || 0) + 1; });
    console.log('  [DRY_RUN] por barrio:', porBarrio);
    return { insertadas: filas.length, borradas: 0 };
  }
  // Upsert por lotes
  for (let i = 0; i < filas.length; i += 200) {
    const lote = filas.slice(i, i + 200);
    const { error } = await db.from(tabla).upsert(lote, { onConflict: 'id_externo' });
    if (error) throw new Error(`Upsert en ${tabla}: ${error.message}`);
  }
  // Borrar lo obsoleto de esa fuente
  const idsVigentes = new Set(filas.map(f => String(f.id_externo)));
  const { data: existentes, error: errLeer } = await db.from(tabla).select('id, id_externo').eq('fuente', fuente);
  if (errLeer) throw new Error(`Lectura en ${tabla}: ${errLeer.message}`);
  const obsoletos = (existentes || []).filter(e => !idsVigentes.has(String(e.id_externo))).map(e => e.id);
  for (let i = 0; i < obsoletos.length; i += 200) {
    const { error } = await db.from(tabla).delete().in('id', obsoletos.slice(i, i + 200));
    if (error) throw new Error(`Borrado en ${tabla}: ${error.message}`);
  }
  return { insertadas: filas.length, borradas: obsoletos.length };
}
