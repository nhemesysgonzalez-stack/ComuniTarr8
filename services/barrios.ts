// Barrios de Tarragona usados en toda la app (coinciden con pages/NeighborhoodSelection.tsx).
// `GENERAL` = contenido para toda la ciudad (se muestra siempre junto al del barrio).

export const GENERAL = 'GENERAL';

export interface BarrioInfo {
  nombre: string;
  lat: number;
  lng: number;
  /** Palabras que, si aparecen en dirección/lugar/título, asignan el barrio con seguridad. */
  claves: string[];
}

export const BARRIOS: BarrioInfo[] = [
  { nombre: 'Part Alta',              lat: 41.1190, lng: 1.2575, claves: ['part alta', 'catedral', 'amfiteatre', 'pretori', 'plaça del fòrum', 'pl. del pallol', 'plaça del rei', 'cap de la part alta'] },
  { nombre: 'Eixample',               lat: 41.1155, lng: 1.2490, claves: ['rambla nova', 'eixample'] },
  { nombre: 'Nou Eixample',           lat: 41.1195, lng: 1.2430, claves: ['nou eixample'] },
  { nombre: 'El Serrallo',            lat: 41.1085, lng: 1.2530, claves: ['serrallo', 'moll de costa', 'moll de pescadors', 'tinglado'] },
  { nombre: 'Sant Pere i Sant Pau',   lat: 41.1255, lng: 1.2420, claves: ['sant pere i sant pau', 'pont del diable'] },
  { nombre: 'Torreforta',             lat: 41.1380, lng: 1.2630, claves: ['torreforta'] },
  { nombre: 'Campclar',               lat: 41.1360, lng: 1.2330, claves: ['campclar'] },
  { nombre: 'Bonavista',              lat: 41.1450, lng: 1.2790, claves: ['bonavista'] },
  { nombre: 'Sant Salvador',          lat: 41.1619, lng: 1.2432, claves: ['sant salvador'] },
  { nombre: 'Llevant / La Móra',      lat: 41.1354, lng: 1.3065, claves: ['llevant', 'la móra', 'la mora', 'monnars'] },
  { nombre: "Vall de l'Arrabassada",  lat: 41.1250, lng: 1.2840, claves: ['arrabassada'] },
];

export const NOMBRES_BARRIOS = BARRIOS.map(b => b.nombre);

const ALIAS: Record<string, string> = {
  'serrallo': 'El Serrallo',
  'el serrallo': 'El Serrallo',
  'part alta': 'Part Alta',
  'eixample': 'Eixample',
  'nou eixample': 'Nou Eixample',
  'sant pere i sant pau': 'Sant Pere i Sant Pau',
  'torreforta': 'Torreforta',
  'campclar': 'Campclar',
  'bonavista': 'Bonavista',
  'sant salvador': 'Sant Salvador',
  'llevant': 'Llevant / La Móra',
  'llevant / la móra': 'Llevant / La Móra',
  'la mora': 'Llevant / La Móra',
  "vall de l'arrabassada": "Vall de l'Arrabassada",
  'arrabassada': "Vall de l'Arrabassada",
  'general': GENERAL,
  'centre': 'Eixample',
};

/** Normaliza cualquier nombre de barrio (mayúsculas, alias) al valor canónico. */
export function normalizarBarrio(valor?: string | null): string {
  if (!valor) return GENERAL;
  const k = valor.trim().toLowerCase();
  return ALIAS[k] ?? (NOMBRES_BARRIOS.find(n => n.toLowerCase() === k) ?? GENERAL);
}

/** Barrio del usuario conectado (o GENERAL si aún no eligió). */
export function barrioDeUsuario(user: any): string {
  return normalizarBarrio(user?.user_metadata?.neighborhood);
}

/** Distancia aproximada en km (equirectangular, suficiente a escala de ciudad). */
function distanciaKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const x = (lng2 - lng1) * Math.cos(((lat1 + lat2) / 2) * Math.PI / 180);
  const y = lat2 - lat1;
  return Math.sqrt(x * x + y * y) * 111.32;
}

/** Barrio más cercano a unas coordenadas (GENERAL si está lejos de todos). */
export function barrioPorCoordenadas(lat?: number | null, lng?: number | null, maxKm = 2.2): string {
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) return GENERAL;
  let mejor = GENERAL;
  let min = Infinity;
  for (const b of BARRIOS) {
    const d = distanciaKm(lat, lng, b.lat, b.lng);
    if (d < min) { min = d; mejor = b.nombre; }
  }
  return min <= maxKm ? mejor : GENERAL;
}

/** Barrio por palabras clave en texto; si no hay coincidencia, por coordenadas. */
export function asignarBarrio(texto: string, lat?: number | null, lng?: number | null): string {
  const t = (texto || '').toLowerCase();
  for (const b of BARRIOS) {
    if (b.claves.some(c => t.includes(c))) return b.nombre;
  }
  return barrioPorCoordenadas(lat, lng);
}

/** Valores de `barrio` que debe ver un usuario: el suyo + toda la ciudad. */
export function barriosVisibles(barrio: string): string[] {
  return barrio === GENERAL ? [GENERAL] : [barrio, GENERAL];
}
