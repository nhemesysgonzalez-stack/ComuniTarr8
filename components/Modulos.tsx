import React from 'react';
import { GENERAL, NOMBRES_BARRIOS, barriosVisibles } from '../services/barrios';
import { formatearTelefono, mailHref, telHref, urlSegura } from '../services/contacto';

/* ------------------------------------------------------------------ */
/* Selector de barrio: "Mi barrio" · "Toda la ciudad" · resto de barrios */
/* ------------------------------------------------------------------ */
export const TODA_LA_CIUDAD = '__TODA__';

/** Barrios a consultar según la vista elegida (undefined = sin filtro). */
export function barriosDeVista(vista: string): string[] | undefined {
  return vista === TODA_LA_CIUDAD ? undefined : barriosVisibles(vista);
}

export const SelectorBarrio: React.FC<{
  vista: string;
  miBarrio: string;
  onChange: (v: string) => void;
}> = ({ vista, miBarrio, onChange }) => {
  const otros = NOMBRES_BARRIOS.filter(b => b !== miBarrio);
  const base = 'shrink-0 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all border';
  const activo = 'bg-primary text-white border-primary shadow-lg shadow-primary/30';
  const inactivo = 'bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary';
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide" role="tablist" aria-label="Filtrar por barrio">
      {miBarrio !== GENERAL && (
        <button role="tab" aria-selected={vista === miBarrio} onClick={() => onChange(miBarrio)} className={`${base} ${vista === miBarrio ? activo : inactivo}`}>
          📍 {miBarrio}
        </button>
      )}
      <button role="tab" aria-selected={vista === TODA_LA_CIUDAD} onClick={() => onChange(TODA_LA_CIUDAD)} className={`${base} ${vista === TODA_LA_CIUDAD ? activo : inactivo}`}>
        🌆 Toda la ciudad
      </button>
      {otros.map(b => (
        <button key={b} role="tab" aria-selected={vista === b} onClick={() => onChange(b)} className={`${base} ${vista === b ? activo : inactivo}`}>
          {b}
        </button>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Botones de acción real: llamar, escribir, abrir enlace oficial      */
/* ------------------------------------------------------------------ */
export const BotonesContacto: React.FC<{
  telefono?: string | null;
  email?: string | null;
  url?: string | null;
  textoUrl?: string;
  compacto?: boolean;
}> = ({ telefono, email, url, textoUrl = 'Más información', compacto }) => {
  const tel = telHref(telefono);
  const mail = mailHref(email);
  const web = urlSegura(url);
  if (!tel && !mail && !web) return null;
  const btn = `inline-flex items-center gap-1.5 rounded-xl font-black uppercase tracking-wider transition-all active:scale-95 ${compacto ? 'px-3 py-1.5 text-[10px]' : 'px-4 py-2.5 text-xs'}`;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {tel && (
        <a href={tel} className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700 shadow-md`} aria-label={`Llamar al ${formatearTelefono(telefono)}`}>
          <span className="material-symbols-outlined text-base">call</span>{formatearTelefono(telefono)}
        </a>
      )}
      {mail && (
        <a href={mail} className={`${btn} bg-sky-600 text-white hover:bg-sky-700 shadow-md`}>
          <span className="material-symbols-outlined text-base">mail</span>Email
        </a>
      )}
      {web && (
        <a href={web} target="_blank" rel="noopener noreferrer" className={`${btn} bg-primary text-white hover:bg-primary-hover shadow-md`}>
          <span className="material-symbols-outlined text-base">open_in_new</span>{textoUrl}
        </a>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Insignia de origen del dato                                         */
/* ------------------------------------------------------------------ */
export const InsigniaFuente: React.FC<{ fuente?: string; verificado?: boolean }> = ({ fuente, verificado }) => {
  const etiquetas: Record<string, string> = {
    vecino: 'Vecino/a',
    agenda_cultural: 'Agenda Cultural · Generalitat',
    feina_activa: 'Feina Activa · SOC',
    osm: 'OpenStreetMap',
  };
  const oficial = fuente && fuente !== 'vecino';
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${oficial ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
      <span className="material-symbols-outlined text-[12px]">{oficial || verificado ? 'verified' : 'person'}</span>
      {etiquetas[fuente || 'vecino'] || fuente}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Estado vacío / carga / error                                        */
/* ------------------------------------------------------------------ */
export const EstadoVacio: React.FC<{
  icono: string;
  titulo: string;
  texto: string;
  accion?: { texto: string; onClick: () => void };
}> = ({ icono, titulo, texto, accion }) => (
  <div className="text-center py-14 px-6 bg-white dark:bg-surface-dark rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
    <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">{icono}</span>
    <h3 className="mt-3 text-lg font-black text-gray-700 dark:text-gray-200">{titulo}</h3>
    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">{texto}</p>
    {accion && (
      <button onClick={accion.onClick} className="mt-5 bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg active:scale-95 transition-all">
        {accion.texto}
      </button>
    )}
  </div>
);

export const Cargando: React.FC<{ texto?: string }> = ({ texto = 'Cargando…' }) => (
  <div className="flex items-center justify-center gap-3 py-14 text-gray-400">
    <span className="material-symbols-outlined animate-spin">progress_activity</span>
    <span className="text-sm font-bold">{texto}</span>
  </div>
);

export const AvisoBaseDatos: React.FC<{ faltaTabla: boolean; error: string | null }> = ({ faltaTabla, error }) => {
  if (!error) return null;
  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-700/50 p-4 text-sm text-amber-800 dark:text-amber-200 flex gap-3">
      <span className="material-symbols-outlined">warning</span>
      <div>
        <p className="font-black">{faltaTabla ? 'Falta activar la base de datos de este módulo' : 'No se pudieron cargar los datos'}</p>
        <p className="text-xs opacity-80 mt-0.5">
          {faltaTabla
            ? 'Hay que ejecutar supabase/migrations/001_estructura_real.sql en Supabase (SQL Editor).'
            : error}
        </p>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Cabecera de módulo                                                  */
/* ------------------------------------------------------------------ */
export const CabeceraModulo: React.FC<{
  icono: string;
  titulo: string;
  subtitulo: string;
  gradiente?: string;
  accion?: { texto: string; onClick: () => void };
}> = ({ icono, titulo, subtitulo, gradiente = 'from-primary to-sky-500', accion }) => (
  <div className={`relative overflow-hidden rounded-[32px] bg-gradient-to-br ${gradiente} text-white p-7 md:p-9 shadow-2xl`}>
    <span className="material-symbols-outlined absolute -right-6 -bottom-8 text-[180px] opacity-10 select-none">{icono}</span>
    <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl">{icono}</span>{titulo}
        </h1>
        <p className="mt-2 text-white/85 max-w-2xl font-medium">{subtitulo}</p>
      </div>
      {accion && (
        <button onClick={accion.onClick} className="shrink-0 bg-white text-gray-900 font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">add_circle</span>{accion.texto}
        </button>
      )}
    </div>
  </div>
);
