import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { barrioDeUsuario } from '../services/barrios';
import { esTelefonoValido, formatearTelefono } from '../services/contacto';
import { etiquetaDia, fechaLocalISO, useTabla } from '../services/datos';
import {
  AvisoBaseDatos, BotonesContacto, CabeceraModulo, Cargando, EstadoVacio,
  InsigniaFuente, SelectorBarrio, barriosDeVista,
} from '../components/Modulos';

interface Evento {
  id: string;
  titulo: string;
  descripcion: string | null;
  categoria: string | null;
  barrio: string;
  fecha_actividad: string;
  fecha_fin: string | null;
  hora: string | null;
  ubicacion: string | null;
  direccion: string | null;
  lat: number | null;
  lng: number | null;
  telefono: string | null;
  email: string | null;
  url: string | null;
  gratuito: boolean | null;
  fuente: string;
  verificado: boolean;
  creador_id: string | null;
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const CATEGORIAS = ['Cultura', 'Ocio', 'Deporte', 'Taller', 'Infantil', 'Música', 'Solidario', 'Otro'];

const iso = (y: number, m: number, d: number) => fechaLocalISO(new Date(y, m, d));

const NeighborhoodCalendar: React.FC = () => {
  const { user, addPoints } = useAuth();
  const miBarrio = barrioDeUsuario(user);
  const hoy = fechaLocalISO();

  const [vista, setVista] = useState(miBarrio);
  const [cursor, setCursor] = useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; });
  const [diaSel, setDiaSel] = useState(hoy);
  const [modal, setModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');

  const primerDia = iso(cursor.y, cursor.m, 1);
  const ultimoDia = iso(cursor.y, cursor.m + 1, 0);

  const { datos, cargando, error, faltaTabla, recargar } = useTabla<Evento>('eventos', {
    barrios: barriosDeVista(vista),
    orden: { col: 'fecha_actividad', asc: true },
    clave: `${primerDia}|${ultimoDia}`,
    limite: 1500,
    filtro: q => q
      .lte('fecha_actividad', ultimoDia)
      .or(`fecha_fin.gte.${primerDia},and(fecha_fin.is.null,fecha_actividad.gte.${primerDia})`),
  });

  // Día → eventos que ocurren ese día (los eventos de varios días marcan todos sus días)
  const porDia = useMemo(() => {
    const mapa: Record<string, Evento[]> = {};
    for (const ev of datos) {
      const ini = ev.fecha_actividad < primerDia ? primerDia : ev.fecha_actividad;
      const finReal = ev.fecha_fin || ev.fecha_actividad;
      const fin = finReal > ultimoDia ? ultimoDia : finReal;
      for (let d = new Date(ini + 'T12:00:00'); fechaLocalISO(d) <= fin; d.setDate(d.getDate() + 1)) {
        const k = fechaLocalISO(d);
        (mapa[k] ||= []).push(ev);
      }
    }
    return mapa;
  }, [datos, primerDia, ultimoDia]);

  const eventosDia = useMemo(() => {
    const lista = [...(porDia[diaSel] || [])];
    const duracion = (e: Evento) => (new Date((e.fecha_fin || e.fecha_actividad) + 'T12:00:00').getTime() - new Date(e.fecha_actividad + 'T12:00:00').getTime());
    // Primero lo puntual (un día), luego exposiciones y ciclos largos
    return lista.sort((a, b) => duracion(a) - duracion(b) || a.titulo.localeCompare(b.titulo));
  }, [porDia, diaSel]);

  // Rejilla del mes (semana empieza en lunes)
  const celdas = useMemo(() => {
    const offset = (new Date(cursor.y, cursor.m, 1).getDay() + 6) % 7;
    const total = new Date(cursor.y, cursor.m + 1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  }, [cursor]);

  const cambiarMes = (delta: number) => {
    const f = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: f.getFullYear(), m: f.getMonth() });
  };

  const crearEvento = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorForm('');
    const f = new FormData(e.currentTarget);
    const telefono = String(f.get('telefono') || '').trim();
    if (!esTelefonoValido(telefono)) { setErrorForm('Introduce un teléfono de contacto español válido (9 cifras).'); return; }
    if (!user) { setErrorForm('Inicia sesión para publicar.'); return; }
    setGuardando(true);
    const fecha = String(f.get('fecha'));
    const { error: err } = await supabase.from('eventos').insert({
      titulo: String(f.get('titulo')).trim(),
      descripcion: String(f.get('descripcion') || '').trim() || null,
      categoria: String(f.get('categoria')),
      fecha_actividad: fecha,
      hora: String(f.get('hora') || '') || null,
      ubicacion: String(f.get('ubicacion') || '').trim() || null,
      telefono: formatearTelefono(telefono),
      email: String(f.get('email') || '').trim() || null,
      barrio: miBarrio,
      fuente: 'vecino',
      creador_id: user.id,
    });
    setGuardando(false);
    if (err) { setErrorForm(`No se pudo publicar: ${err.message}`); return; }
    try { await addPoints(10, 1); } catch { /* los puntos son opcionales */ }
    setModal(false);
    setDiaSel(fecha);
    const d = new Date(fecha + 'T12:00:00');
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
    recargar();
  };

  const borrar = async (id: string) => {
    if (!confirm('¿Eliminar esta actividad?')) return;
    const { error: err } = await supabase.from('eventos').delete().eq('id', id);
    if (err) alert(err.message); else recargar();
  };

  const diaSelDate = new Date(diaSel + 'T12:00:00');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark pb-24 font-sans">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        <CabeceraModulo
          icono="calendar_month"
          titulo="Calendario de Tarragona"
          subtitulo="Actividades reales de tu barrio y de toda la ciudad, actualizadas cada día desde la Agenda Cultural y los propios vecinos."
          gradiente="from-indigo-600 via-primary to-sky-500"
          accion={{ texto: 'Publicar actividad', onClick: () => setModal(true) }}
        />

        <SelectorBarrio vista={vista} miBarrio={miBarrio} onChange={setVista} />
        <AvisoBaseDatos faltaTabla={faltaTabla} error={error} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Mes */}
          <section className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 h-fit" aria-label="Calendario mensual">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => cambiarMes(-1)} className="size-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center" aria-label="Mes anterior">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <h2 className="font-black text-lg uppercase tracking-widest text-gray-800 dark:text-white">{MESES[cursor.m]} {cursor.y}</h2>
              <button onClick={() => cambiarMes(1)} className="size-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center" aria-label="Mes siguiente">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {DIAS.map(d => <span key={d} className="text-[10px] font-black text-gray-400">{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {celdas.map((dia, i) => {
                if (!dia) return <span key={`v${i}`} />;
                const k = iso(cursor.y, cursor.m, dia);
                const n = porDia[k]?.length || 0;
                const esHoy = k === hoy;
                const sel = k === diaSel;
                return (
                  <button
                    key={k}
                    onClick={() => setDiaSel(k)}
                    aria-label={`${dia} de ${MESES[cursor.m]}${n ? `, ${n} actividades` : ''}`}
                    className={`relative aspect-square rounded-xl text-sm font-bold flex flex-col items-center justify-center transition-all
                      ${sel ? 'bg-primary text-white shadow-lg scale-105' : esHoy ? 'ring-2 ring-primary text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
                  >
                    {dia}
                    {n > 0 && (
                      <span className={`absolute bottom-1 flex items-center gap-0.5 text-[8px] font-black ${sel ? 'text-white/90' : 'text-emerald-600'}`}>
                        <span className={`size-1.5 rounded-full ${sel ? 'bg-white' : 'bg-emerald-500'}`} />{n > 9 ? '9+' : n}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-[11px] text-gray-400 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" /> Días con actividades registradas · se actualiza en tiempo real
            </p>
          </section>

          {/* Lista del día */}
          <section className="lg:col-span-3 space-y-4" aria-live="polite">
            <h2 className="text-xl font-black text-gray-800 dark:text-white capitalize">
              {etiquetaDia(diaSel) === 'Hoy' ? 'Hoy · ' : ''}
              {diaSelDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              <span className="ml-2 text-sm font-bold text-gray-400">{eventosDia.length} actividad{eventosDia.length === 1 ? '' : 'es'}</span>
            </h2>

            {cargando ? <Cargando texto="Cargando actividades…" /> : eventosDia.length === 0 ? (
              <EstadoVacio
                icono="event_busy"
                titulo="Sin actividades este día"
                texto="Prueba con otro día marcado en el calendario, cambia de barrio o publica tú una actividad para tus vecinos."
                accion={{ texto: 'Publicar actividad', onClick: () => setModal(true) }}
              />
            ) : (
              <AnimatePresence initial={false}>
                {eventosDia.map(ev => (
                  <motion.article key={ev.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="bg-white dark:bg-surface-dark rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">{ev.categoria || 'Cultura'}</span>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">📍 {ev.barrio === 'GENERAL' ? 'Toda la ciudad' : ev.barrio}</span>
                      {ev.gratuito === true && <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Gratis</span>}
                      <InsigniaFuente fuente={ev.fuente} verificado={ev.verificado} />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white leading-snug">{ev.titulo}</h3>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 space-y-0.5">
                      {ev.hora && <p className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">schedule</span>{ev.hora}</p>}
                      {(ev.ubicacion || ev.direccion) && (
                        <p className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">location_on</span>{[ev.ubicacion, ev.direccion].filter(Boolean).join(' · ')}</p>
                      )}
                      {ev.fecha_fin && ev.fecha_fin !== ev.fecha_actividad && (
                        <p className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">date_range</span>Del {new Date(ev.fecha_actividad + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} al {new Date(ev.fecha_fin + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
                      )}
                    </div>
                    {ev.descripcion && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{ev.descripcion}</p>}
                    <BotonesContacto telefono={ev.telefono} email={ev.email} url={ev.url} textoUrl="Más información" />
                    <div className="flex gap-3 mt-3">
                      {ev.lat != null && ev.lng != null && (
                        <Link to={`/map?evento=${ev.id}`} className="text-[11px] font-black uppercase tracking-wider text-primary hover:underline flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">map</span>Ver en el mapa
                        </Link>
                      )}
                      {user?.id && ev.creador_id === user.id && (
                        <button onClick={() => borrar(ev.id)} className="text-[11px] font-black uppercase tracking-wider text-red-500 hover:underline flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">delete</span>Eliminar
                        </button>
                      )}
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            )}
          </section>
        </div>
      </div>

      {/* Modal publicar */}
      <AnimatePresence>
        {modal && (
          <motion.div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(false)}>
            <motion.form onSubmit={crearEvento} onClick={e => e.stopPropagation()}
              initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
              className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white dark:bg-surface-dark rounded-t-[32px] md:rounded-[32px] p-6 space-y-3 shadow-2xl">
              <h2 className="text-xl font-black dark:text-white">Publicar actividad en {miBarrio === 'GENERAL' ? 'Tarragona' : miBarrio}</h2>
              <input name="titulo" required maxLength={120} placeholder="Título de la actividad" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
              <textarea name="descripcion" rows={3} maxLength={500} placeholder="Descripción (qué, para quién, cómo apuntarse…)" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input name="fecha" type="date" required min={hoy} defaultValue={diaSel >= hoy ? diaSel : hoy} className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
                <input name="hora" type="time" className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
              </div>
              <input name="ubicacion" maxLength={140} placeholder="Lugar (calle, plaza, centro cívico…)" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
              <select name="categoria" defaultValue="Ocio" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm">
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
              <input name="telefono" type="tel" required placeholder="Teléfono de contacto (obligatorio)" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
              <input name="email" type="email" placeholder="Email (opcional)" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
              {errorForm && <p className="text-sm font-bold text-red-500" role="alert">{errorForm}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-gray-100 dark:bg-gray-800 dark:text-gray-200">Cancelar</button>
                <button type="submit" disabled={guardando} className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-primary text-white disabled:opacity-60">{guardando ? 'Publicando…' : 'Publicar'}</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NeighborhoodCalendar;
