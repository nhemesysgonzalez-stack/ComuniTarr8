// Eventos: Agenda Cultural de la Generalitat (datos abiertos, Socrata) filtrada por Tarragona ciudad.
import { SupabaseClient } from '@supabase/supabase-js';
import { asignarBarrio } from '../../services/barrios';
import { fetchConReintentos, hoyMadrid, limpiarTelefono, recortar, reemplazarFuente } from './lib';

const URL_BASE = 'https://analisi.transparenciacatalunya.cat/resource/rhpv-yr4f.json';
const MUNICIPIO = 'agenda:ubicacions/tarragona/tarragones/tarragona';
export const FUENTE_EVENTOS = 'agenda_cultural';

const CATEGORIAS: Record<string, string> = {
  exposicions: 'Exposiciones', concerts: 'Música', teatre: 'Teatro', infantil: 'Infantil',
  'rutes-i-visites': 'Rutas y visitas', conferencies: 'Charlas', cursos: 'Talleres y cursos',
  'festivals-i-mostres': 'Festivales', cicles: 'Ciclos', dansa: 'Danza', cinema: 'Cine',
  'fires-i-mercats': 'Ferias y mercados', 'festes-populars': 'Fiestas populares',
};

function categoria(tags?: string): string {
  const primera = (tags || '').split(',')[0]?.split('/').pop() || '';
  return CATEGORIAS[primera] || 'Cultura';
}

const dia = (s?: string) => (s ? s.slice(0, 10) : null);

export async function sincronizarEventos(db: SupabaseClient) {
  const hoy = hoyMadrid();
  const params = new URLSearchParams({
    $limit: '2000',
    $where: `municipi='${MUNICIPIO}' AND data_fi >= '${hoy}T00:00:00'`,
    $order: 'data_inici',
  });
  const res = await fetchConReintentos(`${URL_BASE}?${params}`);
  const datos: any[] = await res.json();
  console.log(`  Agenda Cultural: ${datos.length} actividades vigentes en Tarragona`);

  const filas = datos
    .filter(d => d.denominaci && d.data_inici)
    .map(d => {
      const lat = d.latitud ? parseFloat(d.latitud) : null;
      const lng = d.longitud ? parseFloat(d.longitud) : null;
      const barrio = asignarBarrio(`${d.espai || ''} ${d.adre_a || ''} ${d.denominaci}`, lat, lng);
      return {
        titulo: recortar(d.denominaci, 200)!,
        descripcion: recortar(d.descripcio || d.subt_tol, 600),
        categoria: categoria(d.tags_categor_es),
        barrio,
        fecha_actividad: dia(d.data_inici),
        fecha_fin: dia(d.data_fi),
        hora: recortar(d.horari, 120),
        ubicacion: recortar(d.espai, 160),
        direccion: recortar(d.adre_a, 200),
        lat, lng,
        telefono: limpiarTelefono(d.tel_fon),
        email: d.email || null,
        url: d.url || (d.enlla_os ? String(d.enlla_os).split(',')[0] : null) || null,
        gratuito: d.gratuita === 'Sí' ? true : d.gratuita === 'No' ? false : null,
        fuente: FUENTE_EVENTOS,
        id_externo: `agenda:${d.codi}`,
        verificado: true,
        fecha_publicacion: hoy,
      };
    });

  const r = await reemplazarFuente(db, 'eventos', FUENTE_EVENTOS, filas);
  console.log(`  eventos: ${r.insertadas} sincronizados, ${r.borradas} caducados eliminados`);
  return r;
}
