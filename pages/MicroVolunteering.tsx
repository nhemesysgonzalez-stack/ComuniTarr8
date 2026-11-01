import React, { useState } from 'react';
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

interface Voluntariado {
  id: string;
  titulo: string;
  descripcion: string | null;
  entidad: string | null;
  barrio: string;
  ubicacion: string | null;
  telefono: string | null;
  email: string | null;
  url: string | null;
  fecha_actividad: string | null;
  hora: string | null;
  fuente: string;
  verificado: boolean;
  creador_id: string | null;
  fecha_publicacion: string;
}

const MicroVolunteering: React.FC = () => {
  const { user, addPoints } = useAuth();
  const miBarrio = barrioDeUsuario(user);
  const hoy = fechaLocalISO();
  const [vista, setVista] = useState(miBarrio);
  const [modal, setModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');

  const { datos, cargando, error, faltaTabla, recargar } = useTabla<Voluntariado>('voluntariados', {
    barrios: barriosDeVista(vista),
    clave: hoy,
    // Solo lo vigente: sin fecha (continuo) o de hoy en adelante
    filtro: q => q.or(`fecha_actividad.is.null,fecha_actividad.gte.${hoy}`),
    orden: { col: 'fecha_actividad', asc: true },
  });

  const publicar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorForm('');
    const f = new FormData(e.currentTarget);
    const telefono = String(f.get('telefono') || '').trim();
    if (!esTelefonoValido(telefono)) { setErrorForm('Introduce un teléfono de contacto español válido (9 cifras).'); return; }
    if (!user) { setErrorForm('Inicia sesión para publicar.'); return; }
    setGuardando(true);
    const { error: err } = await supabase.from('voluntariados').insert({
      titulo: String(f.get('titulo')).trim(),
      descripcion: String(f.get('descripcion') || '').trim() || null,
      entidad: String(f.get('entidad') || '').trim() || null,
      ubicacion: String(f.get('ubicacion') || '').trim() || null,
      telefono: formatearTelefono(telefono),
      email: String(f.get('email') || '').trim() || null,
      fecha_actividad: String(f.get('fecha') || '') || null,
      hora: String(f.get('hora') || '') || null,
      barrio: miBarrio,
      fuente: 'vecino',
      creador_id: user.id,
    });
    setGuardando(false);
    if (err) { setErrorForm(`No se pudo publicar: ${err.message}`); return; }
    try { await addPoints(15, 1); } catch { /* opcional */ }
    setModal(false);
    recargar();
  };

  const borrar = async (id: string) => {
    if (!confirm('¿Eliminar esta propuesta de voluntariado?')) return;
    const { error: err } = await supabase.from('voluntariados').delete().eq('id', id);
    if (err) alert(err.message); else recargar();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark pb-24 font-sans">
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        <CabeceraModulo
          icono="volunteer_activism"
          titulo="Voluntariado por barrios"
          subtitulo="Propuestas reales de vecinos y entidades de tu barrio. Cada una incluye un teléfono de contacto directo."
          gradiente="from-rose-600 via-pink-500 to-orange-400"
          accion={{ texto: 'Ofrecer o pedir ayuda', onClick: () => setModal(true) }}
        />
        <SelectorBarrio vista={vista} miBarrio={miBarrio} onChange={setVista} />
        <AvisoBaseDatos faltaTabla={faltaTabla} error={error} />

        {cargando ? <Cargando texto="Buscando voluntariados…" /> : datos.length === 0 ? (
          <EstadoVacio
            icono="volunteer_activism"
            titulo="Aún no hay propuestas en esta zona"
            texto="Este espacio lo llenan los vecinos y las entidades del barrio. Sé la primera persona en publicar una necesidad o una oferta de ayuda."
            accion={{ texto: 'Publicar propuesta', onClick: () => setModal(true) }}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {datos.map(v => (
              <motion.article key={v.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-surface-dark rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">📍 {v.barrio === 'GENERAL' ? 'Toda la ciudad' : v.barrio}</span>
                  <InsigniaFuente fuente={v.fuente} verificado={v.verificado} />
                  {v.verificado && <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Entidad verificada</span>}
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white leading-snug">{v.titulo}</h3>
                {v.entidad && <p className="text-sm font-bold text-rose-600">{v.entidad}</p>}
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 space-y-0.5">
                  {v.fecha_actividad && <p className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">event</span><span className="capitalize">{etiquetaDia(v.fecha_actividad)}</span>{v.hora && ` · ${v.hora}`}</p>}
                  {!v.fecha_actividad && <p className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">autorenew</span>Voluntariado continuo</p>}
                  {v.ubicacion && <p className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">location_on</span>{v.ubicacion}</p>}
                </div>
                {v.descripcion && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{v.descripcion}</p>}
                <div className="mt-auto">
                  <BotonesContacto telefono={v.telefono} email={v.email} url={v.url} textoUrl="Web de la entidad" />
                  {user?.id && v.creador_id === user.id && (
                    <button onClick={() => borrar(v.id)} className="mt-3 text-[11px] font-black uppercase tracking-wider text-red-500 hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">delete</span>Eliminar mi propuesta
                    </button>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(false)}>
            <motion.form onSubmit={publicar} onClick={e => e.stopPropagation()} initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
              className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white dark:bg-surface-dark rounded-t-[32px] md:rounded-[32px] p-6 space-y-3 shadow-2xl">
              <h2 className="text-xl font-black dark:text-white">Publicar voluntariado en {miBarrio === 'GENERAL' ? 'Tarragona' : miBarrio}</h2>
              <input name="titulo" required maxLength={120} placeholder="¿Qué se necesita u ofreces?" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
              <textarea name="descripcion" rows={3} maxLength={500} placeholder="Detalles: tareas, horario, requisitos…" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
              <input name="entidad" maxLength={120} placeholder="Entidad u organización (opcional)" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
              <input name="ubicacion" maxLength={140} placeholder="Lugar o dirección" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input name="fecha" type="date" min={hoy} className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" aria-label="Fecha (vacío = continuo)" />
                <input name="hora" type="time" className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
              </div>
              <input name="telefono" type="tel" required placeholder="Teléfono de contacto (obligatorio)" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
              <input name="email" type="email" placeholder="Email (opcional)" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
              {errorForm && <p className="text-sm font-bold text-red-500" role="alert">{errorForm}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-gray-100 dark:bg-gray-800 dark:text-gray-200">Cancelar</button>
                <button type="submit" disabled={guardando} className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-rose-600 text-white disabled:opacity-60">{guardando ? 'Publicando…' : 'Publicar'}</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MicroVolunteering;
