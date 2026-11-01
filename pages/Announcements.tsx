import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { barrioDeUsuario } from '../services/barrios';
import { fechaLocalISO, useTabla } from '../services/datos';
import { urlSegura } from '../services/contacto';
import {
  AvisoBaseDatos, CabeceraModulo, Cargando, EstadoVacio, SelectorBarrio, barriosDeVista,
} from '../components/Modulos';

interface Aviso {
  id: string;
  title: string;
  content: string;
  category: string | null;
  author_name?: string | null;
  created_at: string;
  barrio: string | null;
  neighborhood?: string | null;
  itinerary?: string | string[] | null;
  link_url?: string | null;
  expires_at?: string | null;
}

/** Tipos de aviso: alertas, cortes de agua y luz, averías, obras… cada uno con su color. */
const TIPOS: Record<string, { label: string; icono: string; chip: string; borde: string }> = {
  URGENTE:   { label: 'Urgente',        icono: 'priority_high',  chip: 'bg-red-100 text-red-700',       borde: 'border-l-red-500' },
  ALERTA:    { label: 'Alerta / alarma', icono: 'emergency',      chip: 'bg-rose-100 text-rose-700',     borde: 'border-l-rose-500' },
  CORTE_AGUA:{ label: 'Corte de agua',  icono: 'water_drop',     chip: 'bg-sky-100 text-sky-700',       borde: 'border-l-sky-500' },
  CORTE_LUZ: { label: 'Corte de luz',   icono: 'bolt',           chip: 'bg-amber-100 text-amber-700',   borde: 'border-l-amber-500' },
  AVERIA:    { label: 'Avería',         icono: 'build',          chip: 'bg-orange-100 text-orange-700', borde: 'border-l-orange-500' },
  OBRAS:     { label: 'Obras y tráfico', icono: 'construction',   chip: 'bg-yellow-100 text-yellow-800', borde: 'border-l-yellow-500' },
  TIEMPO:    { label: 'Tiempo',         icono: 'thunderstorm',   chip: 'bg-indigo-100 text-indigo-700', borde: 'border-l-indigo-500' },
  SEGURIDAD: { label: 'Seguridad',      icono: 'shield',         chip: 'bg-purple-100 text-purple-700', borde: 'border-l-purple-500' },
  EVENTO:    { label: 'Evento',         icono: 'event',          chip: 'bg-teal-100 text-teal-700',     borde: 'border-l-teal-500' },
  INFO:      { label: 'Información',    icono: 'info',           chip: 'bg-blue-100 text-blue-700',     borde: 'border-l-blue-500' },
  COMUNIDAD: { label: 'Comunidad',      icono: 'groups',         chip: 'bg-green-100 text-green-700',   borde: 'border-l-green-500' },
};
const TIPOS_PUBLICABLES = ['CORTE_AGUA', 'CORTE_LUZ', 'AVERIA', 'OBRAS', 'ALERTA', 'SEGURIDAD', 'EVENTO', 'INFO', 'COMUNIDAD'];

const tipoDe = (cat?: string | null) => TIPOS[(cat || 'INFO').toUpperCase().replace(/Ó/g, 'O').replace(/É/g, 'E')] || TIPOS.INFO;

const Announcements: React.FC = () => {
  const { user, addPoints } = useAuth();
  const miBarrio = barrioDeUsuario(user);
  const hoy = fechaLocalISO();
  const [vista, setVista] = useState(miBarrio);
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [modal, setModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');

  const hace30 = fechaLocalISO(new Date(Date.now() - 30 * 86_400_000));
  const { datos, cargando, error, faltaTabla, recargar } = useTabla<Aviso>('announcements', {
    barrios: barriosDeVista(vista),
    clave: hoy,
    filtro: q => q
      .gte('created_at', `${hace30}T00:00:00`)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`),
    orden: { col: 'created_at', asc: false },
    limite: 200,
  });

  const visibles = useMemo(
    () => (filtroTipo === 'TODOS' ? datos : datos.filter(a => (a.category || 'INFO').toUpperCase().replace(/Ó/g, 'O') === filtroTipo)),
    [datos, filtroTipo],
  );
  const tiposPresentes = useMemo(() => Array.from(new Set(datos.map(a => (a.category || 'INFO').toUpperCase().replace(/Ó/g, 'O')))).filter(t => TIPOS[t]), [datos]);

  const publicar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorForm('');
    if (!user) { setErrorForm('Inicia sesión para publicar.'); return; }
    const f = new FormData(e.currentTarget);
    const caduca = String(f.get('caduca') || '');
    setGuardando(true);
    const { error: err } = await supabase.from('announcements').insert({
      title: String(f.get('titulo')).trim(),
      content: String(f.get('contenido')).trim(),
      category: String(f.get('tipo')),
      author_name: user.user_metadata?.full_name || 'Vecino/a',
      neighborhood: miBarrio,
      barrio: miBarrio,
      link_url: urlSegura(String(f.get('enlace') || '')) || null,
      expires_at: caduca ? new Date(caduca).toISOString() : null,
    });
    setGuardando(false);
    if (err) { setErrorForm(`No se pudo publicar: ${err.message}`); return; }
    try { await addPoints(15, 5); } catch { /* opcional */ }
    setModal(false);
    recargar();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark pb-24 font-sans">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <CabeceraModulo
          icono="campaign"
          titulo="Avisos de tu barrio"
          subtitulo="Alertas, cortes de agua y luz, averías, obras y novedades que afectan a tu barrio. Solo se muestra lo vigente."
          gradiente="from-red-600 via-rose-500 to-orange-500"
          accion={{ texto: 'Publicar aviso', onClick: () => setModal(true) }}
        />
        <SelectorBarrio vista={vista} miBarrio={miBarrio} onChange={setVista} />

        {tiposPresentes.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filtrar por tipo de aviso">
            {['TODOS', ...tiposPresentes].map(t => (
              <button key={t} role="tab" aria-selected={filtroTipo === t} onClick={() => setFiltroTipo(t)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border transition-all ${filtroTipo === t ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900' : 'bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}>
                {t === 'TODOS' ? 'Todos' : TIPOS[t].label}
              </button>
            ))}
          </div>
        )}

        <AvisoBaseDatos faltaTabla={faltaTabla} error={error} />

        {cargando ? <Cargando texto="Cargando avisos…" /> : visibles.length === 0 ? (
          <EstadoVacio icono="notifications_off" titulo="No hay avisos vigentes en esta zona"
            texto="Cuando haya una alerta, un corte de agua o luz, una avería u obras en tu barrio aparecerá aquí. Si ves algo, avisa a tus vecinos."
            accion={{ texto: 'Publicar aviso', onClick: () => setModal(true) }} />
        ) : (
          <div className="space-y-4">
            {visibles.map(a => {
              const t = tipoDe(a.category);
              const enlace = urlSegura(a.link_url);
              const pasos = a.itinerary ? (Array.isArray(a.itinerary) ? a.itinerary : String(a.itinerary).split('\n')) : [];
              const b = a.barrio || a.neighborhood || 'GENERAL';
              return (
                <motion.article key={a.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 border-l-[10px] ${t.borde}`}>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${t.chip}`}>
                      <span className="material-symbols-outlined text-sm">{t.icono}</span>{t.label}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400">
                      {new Date(a.created_at).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md text-[10px] font-black text-gray-500 uppercase">
                      <span className="material-symbols-outlined text-[12px]">location_on</span>{b === 'GENERAL' ? 'Toda la ciudad' : b}
                    </span>
                    {a.expires_at && (
                      <span className="text-[10px] font-bold text-gray-400">Vigente hasta {new Date(a.expires_at).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white leading-snug">{a.title}</h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{a.content}</p>
                  {pasos.length > 0 && (
                    <ul className="mt-3 space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                      {pasos.map((p, i) => <li key={i} className="flex gap-2"><span className="text-primary font-black">•</span>{p}</li>)}
                    </ul>
                  )}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">{a.author_name || 'Vecino/a'}</span>
                    {enlace && (
                      <a href={enlace} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-[11px] font-black uppercase tracking-wider hover:bg-primary hover:text-white transition-all">
                        <span className="material-symbols-outlined text-base">open_in_new</span>Fuente oficial
                      </a>
                    )}
                  </div>
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
              <h2 className="text-xl font-black dark:text-white">Nuevo aviso en {miBarrio === 'GENERAL' ? 'Tarragona' : miBarrio}</h2>
              <select name="tipo" defaultValue="INFO" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm font-bold">
                {TIPOS_PUBLICABLES.map(k => <option key={k} value={k}>{TIPOS[k].label}</option>)}
              </select>
              <input name="titulo" required maxLength={120} placeholder="Ej: Corte de agua en C/ Unió" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
              <textarea name="contenido" required rows={4} maxLength={800} placeholder="Qué pasa, dónde y desde/hasta cuándo…" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
              <input name="enlace" type="url" placeholder="Enlace a la fuente oficial (opcional)" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
              <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500">Caduca el (opcional)
                <input name="caduca" type="datetime-local" className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
              </label>
              <p className="text-[11px] text-gray-400">Publica solo información verificable. El aviso desaparece solo al caducar.</p>
              {errorForm && <p className="text-sm font-bold text-red-500" role="alert">{errorForm}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-gray-100 dark:bg-gray-800 dark:text-gray-200">Cancelar</button>
                <button type="submit" disabled={guardando} className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-red-600 text-white disabled:opacity-60">{guardando ? 'Publicando…' : 'Publicar'}</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Announcements;
