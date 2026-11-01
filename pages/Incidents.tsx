import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { barrioDeUsuario } from '../services/barrios';
import { esTelefonoValido } from '../services/contacto';
import { useTabla } from '../services/datos';
import {
  AvisoBaseDatos, BotonesContacto, CabeceraModulo, Cargando, EstadoVacio, SelectorBarrio, barriosDeVista,
} from '../components/Modulos';

interface Incidencia {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  contact_info?: string | null;
  neighborhood?: string | null;
  barrio?: string | null;
  image_url?: string | null;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
}

/** La categoría se guarda como prefijo "[CLAVE] " en el título (la tabla no tiene columna propia). */
const CATEGORIAS: Record<string, { label: string; icono: string; color: string }> = {
  AVERIA:    { label: 'Avería',               icono: 'build',        color: 'bg-orange-100 text-orange-700' },
  AGUA:      { label: 'Agua / fuga',          icono: 'water_drop',   color: 'bg-sky-100 text-sky-700' },
  LUZ:       { label: 'Luz / alumbrado',      icono: 'lightbulb',    color: 'bg-amber-100 text-amber-700' },
  OBRAS:     { label: 'Obras / vía pública',  icono: 'construction', color: 'bg-yellow-100 text-yellow-800' },
  LIMPIEZA:  { label: 'Limpieza / residuos',  icono: 'delete',       color: 'bg-lime-100 text-lime-700' },
  SEGURIDAD: { label: 'Seguridad',            icono: 'shield',       color: 'bg-purple-100 text-purple-700' },
  OTROS:     { label: 'Otros',                icono: 'report',       color: 'bg-gray-100 text-gray-700' },
};
const ESTADOS: Record<string, { label: string; color: string }> = {
  open:        { label: 'Abierta',     color: 'bg-red-100 text-red-700' },
  in_progress: { label: 'En curso',    color: 'bg-amber-100 text-amber-700' },
  resolved:    { label: 'Resuelta',    color: 'bg-emerald-100 text-emerald-700' },
};

function separarTitulo(titulo: string): { cat: string; texto: string } {
  const m = /^\[([A-Z]+)\]\s*(.*)$/.exec(titulo || '');
  if (m && CATEGORIAS[m[1]]) return { cat: m[1], texto: m[2] };
  return { cat: 'OTROS', texto: titulo };
}

const Incidents: React.FC = () => {
  const { user } = useAuth();
  const miBarrio = barrioDeUsuario(user);
  const [vista, setVista] = useState(miBarrio);
  const [filtroCat, setFiltroCat] = useState('TODAS');
  const [filtroEstado, setFiltroEstado] = useState<'activas' | 'resueltas'>('activas');
  const [modal, setModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');

  const { datos, cargando, error, faltaTabla, recargar } = useTabla<Incidencia>('incidents', {
    barrios: barriosDeVista(vista),
    orden: { col: 'created_at', asc: false },
    limite: 200,
  });

  const visibles = useMemo(() => datos.filter(i => {
    const resuelta = i.status === 'resolved';
    if (filtroEstado === 'activas' ? resuelta : !resuelta) return false;
    if (filtroCat !== 'TODAS' && separarTitulo(i.title).cat !== filtroCat) return false;
    return true;
  }), [datos, filtroCat, filtroEstado]);

  const publicar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorForm('');
    if (!user) { setErrorForm('Inicia sesión para reportar una incidencia.'); return; }
    const f = new FormData(e.currentTarget);
    const tel = String(f.get('telefono') || '').trim();
    if (tel && !esTelefonoValido(tel)) { setErrorForm('El teléfono no es válido (9 dígitos).'); return; }
    setGuardando(true);
    const { error: err } = await supabase.from('incidents').insert({
      user_id: user.id,
      title: `[${String(f.get('categoria'))}] ${String(f.get('titulo')).trim()}`,
      description: String(f.get('descripcion')).trim(),
      contact_info: tel || null,
      neighborhood: miBarrio,
      barrio: miBarrio,
      status: 'open',
    });
    setGuardando(false);
    if (err) { setErrorForm(`No se pudo guardar: ${err.message}`); return; }
    setModal(false);
    recargar();
  };

  const cambiarEstado = async (id: string, status: Incidencia['status']) => {
    const { error: err } = await supabase.from('incidents').update({ status }).eq('id', id);
    if (err) alert(`No se pudo actualizar: ${err.message}`);
    else recargar();
  };

  const borrar = async (id: string) => {
    if (!window.confirm('¿Eliminar esta incidencia?')) return;
    const { error: err } = await supabase.from('incidents').delete().eq('id', id);
    if (err) alert(`No se pudo eliminar: ${err.message}`);
    else recargar();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark pb-24 font-sans">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <CabeceraModulo
          icono="report"
          titulo="Incidencias del barrio"
          subtitulo="Averías, fugas de agua, alumbrado, obras y problemas en la vía pública, reportados por los vecinos de cada barrio."
          gradiente="from-orange-600 via-amber-500 to-yellow-500"
          accion={{ texto: 'Reportar incidencia', onClick: () => setModal(true) }}
        />
        <SelectorBarrio vista={vista} miBarrio={miBarrio} onChange={setVista} />

        <div className="flex flex-wrap gap-2">
          {(['activas', 'resueltas'] as const).map(s => (
            <button key={s} onClick={() => setFiltroEstado(s)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${filtroEstado === s ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900' : 'bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}>
              {s === 'activas' ? 'Activas' : 'Resueltas'}
            </button>
          ))}
          <span className="w-px bg-gray-200 dark:bg-gray-700 mx-1" />
          {['TODAS', ...Object.keys(CATEGORIAS)].map(c => (
            <button key={c} onClick={() => setFiltroCat(c)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${filtroCat === c ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}>
              {c === 'TODAS' ? 'Todas' : CATEGORIAS[c].label}
            </button>
          ))}
        </div>

        <AvisoBaseDatos faltaTabla={faltaTabla} error={error} />

        {cargando ? <Cargando texto="Cargando incidencias…" /> : visibles.length === 0 ? (
          <EstadoVacio icono="task_alt" titulo="Sin incidencias en esta zona"
            texto="Si ves una avería, una fuga o algo roto en tu barrio, repórtalo para que tus vecinos lo sepan."
            accion={{ texto: 'Reportar incidencia', onClick: () => setModal(true) }} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {visibles.map(i => {
              const { cat, texto } = separarTitulo(i.title);
              const c = CATEGORIAS[cat];
              const est = ESTADOS[i.status] || ESTADOS.open;
              const mia = !!user && user.id === i.user_id;
              const b = i.barrio || i.neighborhood || 'GENERAL';
              return (
                <motion.article key={i.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-surface-dark rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${c.color}`}>
                      <span className="material-symbols-outlined text-sm">{c.icono}</span>{c.label}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${est.color}`}>{est.label}</span>
                  </div>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white leading-snug">{texto}</h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{i.description}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-gray-400">
                    <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span>{b === 'GENERAL' ? 'Toda la ciudad' : b}</span>
                    <span>{new Date(i.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <BotonesContacto telefono={i.contact_info} compacto />
                  {mia && (
                    <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                      {i.status !== 'resolved' && (
                        <button onClick={() => cambiarEstado(i.id, 'resolved')} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">Marcar resuelta</button>
                      )}
                      {i.status === 'open' && (
                        <button onClick={() => cambiarEstado(i.id, 'in_progress')} className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider">En curso</button>
                      )}
                      <button onClick={() => borrar(i.id)} className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider ml-auto">Eliminar</button>
                    </div>
                  )}
                </motion.article>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(false)}>
            <motion.form onSubmit={publicar} onClick={e => e.stopPropagation()} initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
              className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white dark:bg-surface-dark rounded-t-[32px] md:rounded-[32px] p-6 space-y-3 shadow-2xl">
              <h2 className="text-xl font-black dark:text-white">Reportar incidencia en {miBarrio === 'GENERAL' ? 'Tarragona' : miBarrio}</h2>
              <select name="categoria" defaultValue="AVERIA" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm font-bold">
                {Object.entries(CATEGORIAS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <input name="titulo" required maxLength={100} placeholder="Ej: Fuga de agua en C/ Unió" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
              <textarea name="descripcion" required rows={4} maxLength={600} placeholder="Dónde está y qué ocurre…" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
              <input name="telefono" type="tel" placeholder="Teléfono de contacto (opcional)" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
              <p className="text-[11px] text-gray-400">Para emergencias llama al 112. Esta lista no sustituye a los servicios de emergencia.</p>
              {errorForm && <p className="text-sm font-bold text-red-500" role="alert">{errorForm}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-gray-100 dark:bg-gray-800 dark:text-gray-200">Cancelar</button>
                <button type="submit" disabled={guardando} className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-orange-600 text-white disabled:opacity-60">{guardando ? 'Guardando…' : 'Reportar'}</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Incidents;
