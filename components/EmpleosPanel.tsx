import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { barrioDeUsuario } from '../services/barrios';
import { esTelefonoValido, formatearTelefono, telHref, urlSegura } from '../services/contacto';
import { fechaLocalISO, useTabla } from '../services/datos';
import {
  AvisoBaseDatos, BotonesContacto, Cargando, EstadoVacio, InsigniaFuente,
  SelectorBarrio, barriosDeVista,
} from './Modulos';

interface Trabajo {
  id: string; titulo: string; empresa: string | null; descripcion: string | null; barrio: string;
  ubicacion: string | null; telefono: string | null; email: string | null; url_inscripcion: string | null;
  contrato: string | null; jornada: string | null; fuente: string; verificado: boolean;
  creador_id: string | null; fecha_publicacion: string;
}

/** Empleos reales: Feina Activa (SOC) para Tarragona + ofertas publicadas por vecinos/negocios. */
export const EmpleosPanel: React.FC = () => {
  const { user } = useAuth();
  const miBarrio = barrioDeUsuario(user);
  const hoy = fechaLocalISO();
  const [vista, setVista] = useState(miBarrio);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');

  const { datos, cargando, error, faltaTabla, recargar } = useTabla<Trabajo>('trabajos', {
    barrios: barriosDeVista(vista),
    clave: hoy,
    filtro: q => q.or(`fecha_caducidad.is.null,fecha_caducidad.gte.${hoy}`),
    orden: { col: 'fecha_publicacion', asc: false },
    limite: 300,
  });

  const filtrados = useMemo(() => {
    const t = busqueda.trim().toLowerCase();
    if (!t) return datos;
    return datos.filter(d => `${d.titulo} ${d.empresa || ''} ${d.descripcion || ''}`.toLowerCase().includes(t));
  }, [datos, busqueda]);

  const publicar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorForm('');
    const f = new FormData(e.currentTarget);
    const telefono = String(f.get('telefono') || '').trim();
    if (!esTelefonoValido(telefono)) { setErrorForm('Introduce un teléfono de contacto español válido (9 cifras).'); return; }
    if (!user) { setErrorForm('Inicia sesión para publicar.'); return; }
    setGuardando(true);
    const { error: err } = await supabase.from('trabajos').insert({
      titulo: String(f.get('titulo')).trim(),
      empresa: String(f.get('empresa') || '').trim() || null,
      descripcion: String(f.get('descripcion') || '').trim() || null,
      ubicacion: String(f.get('ubicacion') || '').trim() || null,
      telefono: formatearTelefono(telefono),
      email: String(f.get('email') || '').trim() || null,
      barrio: miBarrio,
      fuente: 'vecino',
      creador_id: user.id,
      fecha_caducidad: new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10),
    });
    setGuardando(false);
    if (err) { setErrorForm(`No se pudo publicar: ${err.message}`); return; }
    setModal(false);
    recargar();
  };

  const borrar = async (id: string) => {
    if (!confirm('¿Retirar esta oferta?')) return;
    const { error: err } = await supabase.from('trabajos').delete().eq('id', id);
    if (err) alert(err.message); else recargar();
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-emerald-600 rounded-[35px] p-7 text-white relative overflow-hidden shadow-2xl">
        <span className="material-symbols-outlined absolute -right-6 -bottom-8 text-[190px] opacity-10 select-none">work</span>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80 relative z-10">Actualizado cada día · Fuente oficial</p>
        <h3 className="text-3xl font-black mt-1 mb-2 relative z-10">Ofertas de empleo en Tarragona</h3>
        <p className="opacity-90 max-w-2xl relative z-10 font-medium">
          Vacantes reales del portal <strong>Feina Activa</strong> del Servei d'Ocupació de Catalunya, cada una con su botón de inscripción oficial,
          más ofertas de negocios y vecinos de tu barrio con teléfono directo.
        </p>
        <div className="flex flex-wrap gap-3 mt-5 relative z-10">
          <button onClick={() => setModal(true)} className="bg-white text-emerald-700 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
            Publicar una oferta
          </button>
          <a href="https://www.tarragona.cat/tarragonaimpulsa" target="_blank" rel="noopener noreferrer"
            className="bg-emerald-800/60 border border-white/30 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-800 transition-all">
            Tarragona Impulsa · Orientación laboral
          </a>
          <a href={telHref('977296100')} className="bg-emerald-800/60 border border-white/30 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-800 transition-all flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">call</span>Ajuntament 977 29 61 00
          </a>
        </div>
      </div>

      <SelectorBarrio vista={vista} miBarrio={miBarrio} onChange={setVista} />
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por puesto, empresa o palabra clave…"
          className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark dark:text-white pl-12 pr-4 py-3.5 text-sm" aria-label="Buscar ofertas" />
      </div>
      <AvisoBaseDatos faltaTabla={faltaTabla} error={error} />

      <p className="text-xs font-black uppercase tracking-widest text-gray-400">{filtrados.length} oferta{filtrados.length === 1 ? '' : 's'} vigente{filtrados.length === 1 ? '' : 's'}</p>

      {cargando ? <Cargando texto="Cargando ofertas…" /> : filtrados.length === 0 ? (
        <EstadoVacio icono="work_off" titulo="No hay ofertas con estos filtros"
          texto="Cambia de barrio, borra la búsqueda o publica una oferta si tienes una vacante en tu negocio." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtrados.map(t => {
            const oficial = urlSegura(t.url_inscripcion);
            return (
              <motion.article key={t.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-surface-dark rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">📍 {t.barrio === 'GENERAL' ? 'Tarragona' : t.barrio}</span>
                  <InsigniaFuente fuente={t.fuente} verificado={t.verificado} />
                </div>
                <h4 className="text-base font-black text-gray-900 dark:text-white leading-snug">{t.titulo}</h4>
                {t.empresa && <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{t.empresa}</p>}
                <p className="text-xs text-gray-500 mt-1">{[t.contrato, t.jornada, t.ubicacion].filter(Boolean).join(' · ')}</p>
                {t.descripcion && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-4">{t.descripcion}</p>}
                <div className="mt-auto">
                  <div className="flex flex-wrap gap-2 mt-3">
                    {oficial && (
                      <a href={oficial} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-md active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-base">how_to_reg</span>Inscribirme en la oferta oficial
                      </a>
                    )}
                  </div>
                  <BotonesContacto telefono={t.telefono} email={t.email} compacto />
                  <p className="text-[10px] text-gray-400 mt-3">Publicada el {new Date(t.fecha_publicacion + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</p>
                  {user?.id && t.creador_id === user.id && (
                    <button onClick={() => borrar(t.id)} className="mt-2 text-[11px] font-black uppercase tracking-wider text-red-500 hover:underline">Retirar mi oferta</button>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6" onClick={() => setModal(false)}>
          <form onSubmit={publicar} onClick={e => e.stopPropagation()} className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white dark:bg-surface-dark rounded-t-[32px] md:rounded-[32px] p-6 space-y-3 shadow-2xl">
            <h2 className="text-xl font-black dark:text-white">Publicar oferta en {miBarrio === 'GENERAL' ? 'Tarragona' : miBarrio}</h2>
            <input name="titulo" required maxLength={120} placeholder="Puesto (ej. Dependiente/a)" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
            <input name="empresa" maxLength={120} placeholder="Empresa o negocio" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
            <textarea name="descripcion" rows={3} maxLength={600} placeholder="Funciones, horario, requisitos…" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
            <input name="ubicacion" maxLength={140} placeholder="Dirección del puesto" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
            <input name="telefono" type="tel" required placeholder="Teléfono de contacto (obligatorio)" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
            <input name="email" type="email" placeholder="Email (opcional)" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm" />
            <p className="text-[11px] text-gray-400">La oferta se retira automáticamente a los 30 días.</p>
            {errorForm && <p className="text-sm font-bold text-red-500" role="alert">{errorForm}</p>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)} className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-gray-100 dark:bg-gray-800 dark:text-gray-200">Cancelar</button>
              <button type="submit" disabled={guardando} className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-emerald-600 text-white disabled:opacity-60">{guardando ? 'Publicando…' : 'Publicar'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
