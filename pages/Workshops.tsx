import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { barrioDeUsuario } from '../services/barrios';
import { fechaLocalISO, useTabla } from '../services/datos';
import {
  AvisoBaseDatos, BotonesContacto, CabeceraModulo, Cargando, EstadoVacio,
  InsigniaFuente, SelectorBarrio, barriosDeVista,
} from '../components/Modulos';

interface Centro {
  id: string; nombre: string; descripcion: string | null; barrio: string; direccion: string | null;
  lat: number | null; lng: number | null; telefono: string | null; email: string | null;
  web: string | null; horario: string | null; fuente: string; verificado: boolean;
}
interface Taller {
  id: string; titulo: string; descripcion: string | null; categoria: string | null; barrio: string;
  fecha_actividad: string; fecha_fin: string | null; hora: string | null; ubicacion: string | null;
  telefono: string | null; email: string | null; url: string | null; fuente: string; verificado: boolean;
}

/** Centros cívicos del barrio (con teléfono y mapa) + talleres y cursos vigentes. */
const Workshops: React.FC = () => {
  const { user } = useAuth();
  const miBarrio = barrioDeUsuario(user);
  const hoy = fechaLocalISO();
  const [vista, setVista] = useState(miBarrio);
  const barrios = barriosDeVista(vista);

  const centros = useTabla<Centro>('centros_civicos', { barrios, orden: { col: 'nombre', asc: true } });
  const talleres = useTabla<Taller>('eventos', {
    barrios, clave: hoy,
    filtro: q => q.in('categoria', ['Talleres y cursos', 'Taller', 'Charlas', 'Infantil'])
      .or(`fecha_fin.gte.${hoy},and(fecha_fin.is.null,fecha_actividad.gte.${hoy})`),
    orden: { col: 'fecha_actividad', asc: true },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark pb-24 font-sans">
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        <CabeceraModulo
          icono="apartment"
          titulo="Centros cívicos y talleres"
          subtitulo="Los centros de tu barrio con teléfono y ubicación real, y los talleres y cursos que hay ahora mismo."
          gradiente="from-violet-600 via-purple-500 to-fuchsia-500"
        />
        <SelectorBarrio vista={vista} miBarrio={miBarrio} onChange={setVista} />
        <AvisoBaseDatos faltaTabla={centros.faltaTabla || talleres.faltaTabla} error={centros.error || talleres.error} />

        <section aria-labelledby="h-centros" className="space-y-3">
          <h2 id="h-centros" className="text-xl font-black text-gray-800 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-violet-600">groups</span>Centros y espacios comunitarios
          </h2>
          {centros.cargando ? <Cargando /> : centros.datos.length === 0 ? (
            <EstadoVacio icono="apartment" titulo="Sin centros registrados en esta zona"
              texto="Cuando el robot diario encuentre centros en este barrio aparecerán aquí. Prueba con “Toda la ciudad”." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {centros.datos.map(c => (
                <motion.article key={c.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-surface-dark rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">📍 {c.barrio === 'GENERAL' ? 'Toda la ciudad' : c.barrio}</span>
                    <InsigniaFuente fuente={c.fuente} verificado={c.verificado} />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">{c.nombre}</h3>
                  {c.direccion && <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1"><span className="material-symbols-outlined text-base">location_on</span>{c.direccion}</p>}
                  {c.horario && <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5"><span className="material-symbols-outlined text-base">schedule</span>{c.horario}</p>}
                  <BotonesContacto telefono={c.telefono} email={c.email} url={c.web} textoUrl="Web" />
                  {c.lat != null && c.lng != null && (
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`} target="_blank" rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-primary hover:underline">
                      <span className="material-symbols-outlined text-sm">directions</span>Cómo llegar
                    </a>
                  )}
                </motion.article>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="h-talleres" className="space-y-3">
          <h2 id="h-talleres" className="text-xl font-black text-gray-800 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-fuchsia-600">palette</span>Talleres, cursos y charlas vigentes
          </h2>
          {talleres.cargando ? <Cargando /> : talleres.datos.length === 0 ? (
            <EstadoVacio icono="school" titulo="No hay talleres vigentes ahora"
              texto="Los cursos y talleres de la Agenda Cultural y los que publiquen los vecinos en el calendario aparecerán aquí automáticamente." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {talleres.datos.map(t => (
                <article key={t.id} className="bg-white dark:bg-surface-dark rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-fuchsia-100 text-fuchsia-700 px-2 py-0.5 rounded-full">{t.categoria}</span>
                    <InsigniaFuente fuente={t.fuente} verificado={t.verificado} />
                  </div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white leading-snug">{t.titulo}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(t.fecha_actividad + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    {t.fecha_fin && t.fecha_fin !== t.fecha_actividad && ` → ${new Date(t.fecha_fin + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`}
                    {t.hora && ` · ${t.hora}`}{t.ubicacion && ` · ${t.ubicacion}`}
                  </p>
                  <BotonesContacto telefono={t.telefono} email={t.email} url={t.url} compacto />
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Workshops;
