import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../contexts/AuthContext';
import { barrioDeUsuario, BARRIOS } from '../services/barrios';
import { fechaLocalISO, useTabla } from '../services/datos';
import { formatearTelefono, telHref, urlSegura } from '../services/contacto';
import { AvisoBaseDatos, CabeceraModulo, Cargando, SelectorBarrio, barriosDeVista } from '../components/Modulos';

type Capa = 'eventos' | 'centros' | 'voluntariados' | 'trabajos';
type Rango = 'hoy' | 'semana' | 'todo';

interface Pin {
  id: string;
  capa: Capa;
  lat: number;
  lng: number;
  titulo: string;
  lineas: string[];
  telefono?: string | null;
  url?: string | null;
  barrio: string;
}

const CAPAS: Record<Capa, { nombre: string; color: string; icono: string }> = {
  eventos: { nombre: 'Actividades', color: '#2b8cee', icono: 'event' },
  centros: { nombre: 'Centros cívicos', color: '#7c3aed', icono: 'groups' },
  voluntariados: { nombre: 'Voluntariado', color: '#e11d48', icono: 'volunteer_activism' },
  trabajos: { nombre: 'Empleo', color: '#059669', icono: 'work' },
};

const CENTRO_TARRAGONA: [number, number] = [41.1189, 1.2445];

function icono(capa: Capa, activo = false): L.DivIcon {
  const c = CAPAS[capa];
  return L.divIcon({
    className: 'pin-comunitarr',
    html: `<div style="background:${c.color};width:${activo ? 40 : 32}px;height:${activo ? 40 : 32}px;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 16px rgba(0,0,0,.35);border:2px solid #fff">
      <span class="material-symbols-outlined" style="transform:rotate(45deg);color:#fff;font-size:${activo ? 22 : 18}px">${c.icono}</span></div>`,
    iconSize: [activo ? 40 : 32, activo ? 40 : 32],
    iconAnchor: [activo ? 8 : 6, activo ? 38 : 30],
    popupAnchor: [8, -30],
  });
}

/** Popup construido con nodos DOM (textContent) para no inyectar HTML de terceros. */
function crearPopup(p: Pin): HTMLElement {
  const raiz = document.createElement('div');
  raiz.style.minWidth = '210px';
  const etiqueta = document.createElement('div');
  etiqueta.textContent = CAPAS[p.capa].nombre.toUpperCase();
  etiqueta.style.cssText = `font:900 9px sans-serif;letter-spacing:.12em;color:${CAPAS[p.capa].color}`;
  const h = document.createElement('div');
  h.textContent = p.titulo;
  h.style.cssText = 'font:800 14px sans-serif;margin:2px 0 6px;line-height:1.25';
  raiz.append(etiqueta, h);
  p.lineas.filter(Boolean).forEach(t => {
    const l = document.createElement('div');
    l.textContent = t;
    l.style.cssText = 'font:500 12px sans-serif;color:#555;margin-bottom:2px';
    raiz.append(l);
  });
  const acciones = document.createElement('div');
  acciones.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-top:8px';
  const boton = (texto: string, href: string, fondo: string, externo = false) => {
    const a = document.createElement('a');
    a.href = href; a.textContent = texto;
    if (externo) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    a.style.cssText = `background:${fondo};color:#fff;font:800 11px sans-serif;padding:7px 11px;border-radius:10px;text-decoration:none`;
    acciones.append(a);
  };
  const tel = telHref(p.telefono);
  if (tel) boton(`📞 ${formatearTelefono(p.telefono)}`, tel, '#059669');
  const web = urlSegura(p.url);
  if (web) boton('Más información', web, '#2b8cee', true);
  boton('Cómo llegar', `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`, '#374151', true);
  raiz.append(acciones);
  return raiz;
}

const MapView: React.FC = () => {
  const { user } = useAuth();
  const miBarrio = barrioDeUsuario(user);
  const [params] = useSearchParams();
  const focoId = params.get('evento');

  const [vista, setVista] = useState(miBarrio);
  const [rango, setRango] = useState<Rango>('semana');
  const [capas, setCapas] = useState<Record<Capa, boolean>>({ eventos: true, centros: true, voluntariados: true, trabajos: true });
  const [seleccion, setSeleccion] = useState<string | null>(focoId);

  const hoy = fechaLocalISO();
  const limite = rango === 'hoy' ? hoy : rango === 'semana' ? fechaLocalISO(new Date(Date.now() + 7 * 86_400_000)) : '9999-12-31';
  const barrios = barriosDeVista(vista);

  const ev = useTabla<any>('eventos', {
    barrios, clave: `${hoy}|${limite}`,
    filtro: q => q.not('lat', 'is', null).lte('fecha_actividad', limite)
      .or(`fecha_fin.gte.${hoy},and(fecha_fin.is.null,fecha_actividad.gte.${hoy})`),
    orden: { col: 'fecha_actividad', asc: true }, limite: 400,
  });
  const ce = useTabla<any>('centros_civicos', { barrios, filtro: q => q.not('lat', 'is', null) });
  const vo = useTabla<any>('voluntariados', { barrios, clave: hoy, filtro: q => q.not('lat', 'is', null) });
  const tr = useTabla<any>('trabajos', { barrios, clave: hoy, filtro: q => q.not('lat', 'is', null).or(`fecha_caducidad.is.null,fecha_caducidad.gte.${hoy}`) });

  const pins = useMemo<Pin[]>(() => {
    const lista: Pin[] = [];
    if (capas.eventos) ev.datos.forEach(e => lista.push({
      id: e.id, capa: 'eventos', lat: e.lat, lng: e.lng, titulo: e.titulo, barrio: e.barrio, telefono: e.telefono, url: e.url,
      lineas: [e.hora || '', e.ubicacion || '', e.fecha_fin && e.fecha_fin !== e.fecha_actividad ? `Hasta el ${new Date(e.fecha_fin + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}` : new Date(e.fecha_actividad + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })],
    }));
    if (capas.centros) ce.datos.forEach(c => lista.push({
      id: c.id, capa: 'centros', lat: c.lat, lng: c.lng, titulo: c.nombre, barrio: c.barrio, telefono: c.telefono, url: c.web,
      lineas: [c.direccion || '', c.horario || ''],
    }));
    if (capas.voluntariados) vo.datos.forEach(v => lista.push({
      id: v.id, capa: 'voluntariados', lat: v.lat, lng: v.lng, titulo: v.titulo, barrio: v.barrio, telefono: v.telefono, url: v.url,
      lineas: [v.entidad || '', v.ubicacion || ''],
    }));
    if (capas.trabajos) tr.datos.forEach(t => lista.push({
      id: t.id, capa: 'trabajos', lat: t.lat, lng: t.lng, titulo: t.titulo, barrio: t.barrio, telefono: t.telefono, url: t.url_inscripcion,
      lineas: [t.empresa || '', t.jornada || ''],
    }));
    return lista.filter(p => typeof p.lat === 'number' && typeof p.lng === 'number');
  }, [ev.datos, ce.datos, vo.datos, tr.datos, capas]);

  /* ---- Mapa Leaflet ---- */
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<L.Map | null>(null);
  const capaPins = useRef<L.LayerGroup | null>(null);
  const marcadores = useRef<Record<string, L.Marker>>({});
  const primerEncuadre = useRef(true);

  useEffect(() => {
    if (!contenedor.current || mapa.current) return;
    const m = L.map(contenedor.current, { zoomControl: true, scrollWheelZoom: true }).setView(CENTRO_TARRAGONA, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
    }).addTo(m);
    capaPins.current = L.layerGroup().addTo(m);
    mapa.current = m;
    setTimeout(() => m.invalidateSize(), 150);
    return () => { m.remove(); mapa.current = null; };
  }, []);

  // Pinta/actualiza los pins cuando cambian los datos de Supabase
  useEffect(() => {
    const m = mapa.current; const grupo = capaPins.current;
    if (!m || !grupo) return;
    grupo.clearLayers();
    marcadores.current = {};
    pins.forEach(p => {
      const mk = L.marker([p.lat, p.lng], { icon: icono(p.capa, p.id === seleccion), title: p.titulo }).bindPopup(() => crearPopup(p));
      mk.on('click', () => setSeleccion(p.id));
      mk.addTo(grupo);
      marcadores.current[p.id] = mk;
    });
    if (primerEncuadre.current && pins.length) {
      m.fitBounds(L.latLngBounds(pins.map(p => [p.lat, p.lng] as [number, number])).pad(0.2), { maxZoom: 15 });
      primerEncuadre.current = false;
    }
  }, [pins, seleccion]);

  // Al cambiar de barrio, reencuadrar
  useEffect(() => { primerEncuadre.current = true; }, [vista, rango]);

  // Enfocar un pin concreto (desde el calendario o desde la lista)
  useEffect(() => {
    if (!seleccion || !mapa.current) return;
    const mk = marcadores.current[seleccion];
    if (mk) { mapa.current.setView(mk.getLatLng(), Math.max(mapa.current.getZoom(), 16), { animate: true }); mk.openPopup(); }
  }, [seleccion, pins]);

  const cargando = ev.cargando || ce.cargando || vo.cargando || tr.cargando;
  const errorPrincipal = ev.error || ce.error;
  const centroBarrio = BARRIOS.find(b => b.nombre === vista);
  useEffect(() => {
    if (centroBarrio && mapa.current && !pins.length) mapa.current.setView([centroBarrio.lat, centroBarrio.lng], 15);
  }, [centroBarrio, pins.length]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark pb-24 font-sans">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-5">
        <CabeceraModulo
          icono="map"
          titulo="Mapa vivo de Tarragona"
          subtitulo="Cada pin sale de la base de datos: actividades de hoy y de la semana, centros cívicos, voluntariado y empleo con ubicación. Se actualiza solo."
          gradiente="from-emerald-600 via-teal-500 to-sky-500"
        />

        <SelectorBarrio vista={vista} miBarrio={miBarrio} onChange={v => { setVista(v); setSeleccion(null); }} />

        <div className="flex flex-wrap items-center gap-2">
          {(['hoy', 'semana', 'todo'] as Rango[]).map(r => (
            <button key={r} onClick={() => setRango(r)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border transition-all ${rango === r ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900' : 'bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}>
              {r === 'hoy' ? 'Hoy' : r === 'semana' ? 'Próximos 7 días' : 'Todo lo vigente'}
            </button>
          ))}
          <span className="hidden md:block w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
          {(Object.keys(CAPAS) as Capa[]).map(c => (
            <button key={c} onClick={() => setCapas(p => ({ ...p, [c]: !p[c] }))} aria-pressed={capas[c]}
              className={`px-3 py-2 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 transition-all ${capas[c] ? 'text-white border-transparent shadow-md' : 'bg-white dark:bg-surface-dark text-gray-400 border-gray-200 dark:border-gray-700'}`}
              style={capas[c] ? { background: CAPAS[c].color } : undefined}>
              <span className="material-symbols-outlined text-base">{CAPAS[c].icono}</span>{CAPAS[c].nombre}
            </button>
          ))}
        </div>

        <AvisoBaseDatos faltaTabla={ev.faltaTabla || ce.faltaTabla} error={errorPrincipal} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 relative rounded-3xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800" style={{ isolation: 'isolate' }}>
            <div ref={contenedor} className="h-[60vh] lg:h-[70vh] w-full" role="application" aria-label="Mapa interactivo de Tarragona" />
            {cargando && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] bg-white/95 dark:bg-surface-dark/95 rounded-full px-4 py-2 shadow-lg text-xs font-black flex items-center gap-2">
                <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>Actualizando pins…
              </div>
            )}
          </div>

          <aside className="bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 h-[40vh] lg:h-[70vh] overflow-y-auto" aria-label="Lista de lugares en el mapa">
            <h2 className="font-black text-sm uppercase tracking-widest text-gray-500 mb-3">{pins.length} lugar{pins.length === 1 ? '' : 'es'} en el mapa</h2>
            {cargando && pins.length === 0 ? <Cargando /> : pins.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">No hay pins con ubicación para este barrio y rango. Prueba “Toda la ciudad” o “Todo lo vigente”.</p>
            ) : (
              <ul className="space-y-2">
                {pins.map(p => (
                  <li key={`${p.capa}-${p.id}`}>
                    <button onClick={() => setSeleccion(p.id)}
                      className={`w-full text-left rounded-2xl p-3 border transition-all flex gap-3 items-start ${seleccion === p.id ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-gray-800 hover:border-gray-300'}`}>
                      <span className="size-9 shrink-0 rounded-xl flex items-center justify-center text-white" style={{ background: CAPAS[p.capa].color }}>
                        <span className="material-symbols-outlined text-lg">{CAPAS[p.capa].icono}</span>
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-black text-gray-900 dark:text-white leading-snug line-clamp-2">{p.titulo}</span>
                        <span className="block text-[11px] text-gray-500 mt-0.5 truncate">{p.lineas.filter(Boolean)[0]} · {p.barrio === 'GENERAL' ? 'Toda la ciudad' : p.barrio}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default MapView;
