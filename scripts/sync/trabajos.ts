// Trabajos: feed oficial XML de Feina Activa (Servei Públic d'Ocupació de Catalunya).
// Cada oferta lleva su enlace oficial de inscripción. El feed NO publica teléfonos.
import { SupabaseClient } from '@supabase/supabase-js';
import { XMLParser } from 'fast-xml-parser';
import { fetchConReintentos, hoyMadrid, recortar, reemplazarFuente, sumarDias } from './lib';

const URL_FEED = 'https://feinaactiva.gencat.cat/api/offers/offers-xml';
export const FUENTE_TRABAJOS = 'feina_activa';

const quitarAcentos = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();

/** "04/09/2026" → "2026-09-04" */
function fechaISO(dmy?: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((dmy || '').trim());
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

export async function sincronizarTrabajos(db: SupabaseClient) {
  const hoy = hoyMadrid();
  const municipios = (process.env.SYNC_MUNICIPIOS_EMPLEO || 'TARRAGONA')
    .split(',').map(quitarAcentos).filter(Boolean);

  const res = await fetchConReintentos(URL_FEED);
  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: true, processEntities: true, trimValues: true });
  const raiz = parser.parse(xml);
  const anuncios: any[] = [].concat(raiz?.ads?.ad ?? raiz?.offers?.ad ?? raiz?.root?.ad ?? findAds(raiz));
  console.log(`  Feina Activa: ${anuncios.length} ofertas en Catalunya`);

  const locales = anuncios.filter(a =>
    String(a.status || 'PUBLISHED') === 'PUBLISHED' && municipios.includes(quitarAcentos(String(a.city || ''))));
  console.log(`  -> ${locales.length} ofertas en ${municipios.join(', ')}`);

  const filas = locales.map(a => {
    const publicada = fechaISO(a.date) || hoy;
    return {
      titulo: recortar(String(a.title), 200)!,
      empresa: recortar(a.company ? String(a.company) : null, 160),
      descripcion: recortar(a.content ? String(a.content) : null, 700),
      barrio: 'GENERAL',
      ubicacion: `${String(a.city)}${a.postcode ? ' (' + a.postcode + ')' : ''}`,
      telefono: null,
      email: null,
      url_inscripcion: String(a.url),
      contrato: recortar(a.contract ? String(a.contract) : null, 120),
      jornada: recortar(a.workingHours ? String(a.workingHours) : null, 120),
      fuente: FUENTE_TRABAJOS,
      id_externo: `fa:${a.id}`,
      verificado: true,
      fecha_publicacion: publicada,
      fecha_caducidad: sumarDias(publicada, 90),
    };
  });

  const r = await reemplazarFuente(db, 'trabajos', FUENTE_TRABAJOS, filas);
  console.log(`  trabajos: ${r.insertadas} sincronizados, ${r.borradas} retirados`);
  return r;
}

/** Busca recursivamente el array de <ad> si la raíz del XML tiene otra forma. */
function findAds(nodo: any): any[] {
  if (!nodo || typeof nodo !== 'object') return [];
  if (Array.isArray(nodo.ad)) return nodo.ad;
  if (nodo.ad && typeof nodo.ad === 'object') return [nodo.ad];
  for (const k of Object.keys(nodo)) {
    const r = findAds(nodo[k]);
    if (r.length) return r;
  }
  return [];
}
