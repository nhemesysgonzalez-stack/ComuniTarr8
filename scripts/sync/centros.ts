// Centros cívicos: OpenStreetMap (Overpass) + teléfono general del Ajuntament si el centro no publica el suyo.
import { SupabaseClient } from '@supabase/supabase-js';
import { asignarBarrio } from '../../services/barrios';
import { fetchConReintentos, hoyMadrid, limpiarTelefono, recortar, reemplazarFuente } from './lib';

export const FUENTE_CENTROS = 'osm';
// Centralita oficial del Ajuntament de Tarragona (para centros sin teléfono propio publicado).
export const TELEFONO_AJUNTAMENT = '977 29 61 00';

const QUERY = `[out:json][timeout:60];
area["name"="Tarragona"]["boundary"="administrative"]["admin_level"="8"]->.a;
(nwr["amenity"="community_centre"](area.a););
out center tags;`;

export async function sincronizarCentros(db: SupabaseClient) {
  const hoy = hoyMadrid();
  const res = await fetchConReintentos('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({ data: QUERY }).toString(),
  });
  const json: any = await res.json();
  const elementos: any[] = json.elements || [];
  console.log(`  OpenStreetMap: ${elementos.length} centros comunitarios en Tarragona`);

  const filas = elementos
    .filter(e => e.tags?.name)
    .map(e => {
      const t = e.tags;
      const lat = e.lat ?? e.center?.lat ?? null;
      const lng = e.lon ?? e.center?.lon ?? null;
      const telPropio = limpiarTelefono(t.phone || t['contact:phone']);
      const direccion = [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' ') || null;
      return {
        nombre: recortar(t.name, 160)!,
        descripcion: recortar(t.description, 400),
        barrio: asignarBarrio(`${t.name} ${direccion || ''}`, lat, lng),
        direccion,
        lat, lng,
        telefono: telPropio ?? TELEFONO_AJUNTAMENT,
        email: t.email || t['contact:email'] || null,
        web: t.website || t['contact:website'] || null,
        horario: recortar(t.opening_hours, 200),
        fuente: FUENTE_CENTROS,
        id_externo: `osm:${e.type}/${e.id}`,
        verificado: true,
        fecha_publicacion: hoy,
      };
    });

  const r = await reemplazarFuente(db, 'centros_civicos', FUENTE_CENTROS, filas);
  console.log(`  centros_civicos: ${r.insertadas} sincronizados, ${r.borradas} retirados`);
  return r;
}
