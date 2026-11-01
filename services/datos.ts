import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabaseClient';

export interface OpcionesTabla {
  /** Barrios a mostrar. `undefined` = toda la ciudad. */
  barrios?: string[];
  orden?: { col: string; asc?: boolean };
  /** Filtro adicional sobre el query builder de Supabase. */
  filtro?: (q: any) => any;
  limite?: number;
  /** Clave que cambia cuando cambia el valor del filtro (p. ej. una fecha). */
  clave?: string;
}

export interface ResultadoTabla<T> {
  datos: T[];
  cargando: boolean;
  /** Mensaje de error legible (null si todo bien). */
  error: string | null;
  /** true si la tabla aún no existe en Supabase (falta ejecutar la migración). */
  faltaTabla: boolean;
  recargar: () => void;
}

/**
 * Lee una tabla de Supabase filtrando por barrio y se actualiza EN TIEMPO REAL
 * cuando alguien (un vecino o el robot diario) inserta, edita o borra filas.
 */
export function useTabla<T = any>(tabla: string, opciones: OpcionesTabla = {}): ResultadoTabla<T> {
  const [datos, setDatos] = useState<T[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [faltaTabla, setFaltaTabla] = useState(false);
  const [version, setVersion] = useState(0);

  const claveBarrios = opciones.barrios ? opciones.barrios.join('|') : '*';
  const claveFiltro = opciones.clave ?? (opciones.filtro ? opciones.filtro.toString() : '');
  const orden = opciones.orden;
  const limite = opciones.limite ?? 500;
  const recargar = useCallback(() => setVersion(v => v + 1), []);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      setCargando(true);
      let q: any = supabase.from(tabla).select('*');
      if (opciones.barrios) q = q.in('barrio', opciones.barrios);
      if (opciones.filtro) q = opciones.filtro(q);
      if (orden) q = q.order(orden.col, { ascending: orden.asc ?? true });
      q = q.limit(limite);
      const { data, error: err } = await q;
      if (cancelado) return;
      if (err) {
        const falta = err.code === '42P01' || err.code === 'PGRST205' || /does not exist|Could not find the table/i.test(err.message);
        setFaltaTabla(falta);
        setError(err.message);
        setDatos([]);
      } else {
        setFaltaTabla(false);
        setError(null);
        setDatos((data || []) as T[]);
      }
      setCargando(false);
    })();
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabla, claveBarrios, claveFiltro, orden?.col, orden?.asc, limite, version]);

  // Tiempo real: cualquier cambio en la tabla recarga la lista (con un pequeño debounce).
  useEffect(() => {
    let temporizador: ReturnType<typeof setTimeout> | undefined;
    const canal = supabase
      .channel(`rt-${tabla}-${Math.random().toString(36).slice(2, 8)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tabla }, () => {
        clearTimeout(temporizador);
        temporizador = setTimeout(recargar, 400);
      })
      .subscribe();
    return () => { clearTimeout(temporizador); supabase.removeChannel(canal); };
  }, [tabla, recargar]);

  return useMemo(() => ({ datos, cargando, error, faltaTabla, recargar }), [datos, cargando, error, faltaTabla, recargar]);
}

/** Fecha local (YYYY-MM-DD) del navegador, sin desfases por zona horaria. */
export function fechaLocalISO(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Etiqueta relativa en español: Hoy, Mañana, Ayer o "lun 3 nov". */
export function etiquetaDia(iso?: string | null): string {
  if (!iso) return '';
  const hoy = fechaLocalISO();
  const manana = fechaLocalISO(new Date(Date.now() + 86_400_000));
  const ayer = fechaLocalISO(new Date(Date.now() - 86_400_000));
  if (iso === hoy) return 'Hoy';
  if (iso === manana) return 'Mañana';
  if (iso === ayer) return 'Ayer';
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
}
