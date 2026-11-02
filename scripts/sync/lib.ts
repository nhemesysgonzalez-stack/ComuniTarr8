// Utilidades comunes del robot de sincronización (se ejecuta en GitHub Actions o en local).
// NOTA: Usamos node-https como fetch custom para el cliente de Supabase porque el fetch nativo
// de Node 20 (undici) rechaza caracteres no-Latin-1 en cabeceras HTTP (ByteString error).
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import https from 'node:https';
import http from 'node:http';

export const USER_AGENT = 'ComuniTarr-sync/1.0 (https://github.com/nhemesysgonzalez-stack/ComuniTarr8)';

export const DRY_RUN = process.env.DRY_RUN === '1';

/**
 * Fetch personalizado usando node:https que NO tiene las restricciones de undici.
 * Compatible con la API de fetch (devuelve Response-like).
 */
function nodeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return new Promise((resolve, reject) => {
 const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
const url = new URL(rawUrl.replace(/\u2192/g, '->'));
    const method = init?.method || (input instanceof Request ? input.method : 'GET');
    const bodyData = init?.body ? Buffer.from(String(limpiarTexto(init.body)), 'utf8') : undefined;

    if (bodyData) {
      headers['content-length'] = String(bodyData.length);
    }

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers,
    };

    const mod = url.protocol === 'https:' ? https : http;
    const req = (mod as typeof https).request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        const responseHeaders = new Headers();
        for (const [k, v] of Object.entries(res.headers)) {
          if (v) responseHeaders.set(k, Array.isArray(v) ? v.join(', ') : String(v));
        }
        const status = res.statusCode || 200;
        const bodyText = body.toString('utf8');
        resolve(new Response(bodyText, { status, headers: responseHeaders }));
      });
    });
    req.on('error', reject);
    if (bodyData) req.write(bodyData);
    req.end();
  });
}

function buildHeaders(init?: HeadersInit): Record<string, string> {
  const out: Record<string, string> = {};
  if (!init) return out;

 const clean = (val: any) => String(val || '').replace(/\u2192/g, '->').replace(/[^\x00-\x7F]/g, (c) => encodeURIComponent(c));

  if (init instanceof Headers) {
    init.forEach((v, k) => { out[clean(k)] = clean(v); });
  } else if (Array.isArray(init)) {
    (init as [string, string][]).forEach(([k, v]) => { out[clean(k)] = clean(v); });
  } else {
    Object.keys(init).forEach(k => {
      out[clean(k)] = clean((init as Record<string, any>)[k]);
    });
  }
  return out;
}
export function crearCliente(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'http://dry-run.invalid';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || (DRY_RUN ? 'dry-run' : undefined);
  if (!url || !key) {
    throw new Error('Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY (secretos del repositorio en GitHub).');
  }
  return createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: nodeFetch as unknown as typeof fetch },
  });
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
  // Eliminar caracteres no-Latin-1 que undici rechaza + limpiar espacios
  const limpio = String(texto)
    .replace(/[^\x00-\xFF]/g, ' ')  // quita caracteres fuera de Latin-1
    .replace(/\s+/g, ' ')
    .trim();
  if (!limpio) return null;
  return limpio.length > max ? limpio.slice(0, max - 1).trimEnd() + '...' : limpio;
}

/**
 * Sustituye los datos de una fuente: hace upsert del lote y borra lo que ya no está en el feed.
 */
export async function reemplazarFuente(
  db: SupabaseClient,
  tabla: string,
  fuente: string,
  filas: Record<string, unknown>[],
): Promise<{ insertadas: number; borradas: number }> {
 filas = sanitizar(filas) as Record<string, unknown>[];
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
  // Upsert por lotes de 50 (más pequeño para evitar timeouts y errores de tamaño)
  for (let i = 0; i < filas.length; i += 50) {
    const lote = filas.slice(i, i + 50);
    const { error } = await db.from(tabla).upsert(sanitizar(lote), { onConflict: 'id_externo' });
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
function sanitizar(val: any): any {
  if (typeof val === 'string') return val.replace(/\u2192/g, '->');
  if (Array.isArray(val)) return val.map(sanitizar);
  if (val !== null && typeof val === 'object') {
    const res: Record<string, any> = {};
    for (const k of Object.keys(val)) res[k] = sanitizar(val[k]);
    return res;
  }
  return val;
}
const limpiarTexto = (val: unknown): unknown => {
  if (typeof val === 'string') {
    return val.replace(/\u2192/g, '->').replace(/[^\x00-\x7F]/g, (c) => encodeURIComponent(c));
  }
  if (Array.isArray(val)) {
    return val.map(limpiarTexto);
  }
  if (val !== null && typeof val === 'object') {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val)) {
      obj[limpiarTexto(k) as string] = limpiarTexto(v);
    }
    return obj;
  }
  return val;
};
