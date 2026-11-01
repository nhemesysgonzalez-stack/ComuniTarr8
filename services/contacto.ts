// Utilidades de contacto: enlaces de llamada reales (tel:) y validación de teléfonos españoles.

/** Deja solo dígitos, quitando prefijo +34 / 0034. Devuelve '' si no hay nada. */
export function soloDigitos(valor?: string | null): string {
  let d = (valor || '').replace(/\D/g, '');
  if (d.startsWith('0034')) d = d.slice(4);
  else if (d.startsWith('34') && d.length === 11) d = d.slice(2);
  return d;
}

/** Teléfono fijo (8/9) o móvil (6/7) español de 9 cifras. */
export function esTelefonoValido(valor?: string | null): boolean {
  return /^[6789]\d{8}$/.test(soloDigitos(valor));
}

/** 977296100 → "977 29 61 00" (si no es válido devuelve el texto original). */
export function formatearTelefono(valor?: string | null): string {
  const d = soloDigitos(valor);
  if (!/^[6789]\d{8}$/.test(d)) return (valor || '').trim();
  return `${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 7)} ${d.slice(7)}`;
}

/** Valor para href="tel:..." → "tel:+34977296100" */
export function telHref(valor?: string | null): string | undefined {
  const d = soloDigitos(valor);
  return /^[6789]\d{8}$/.test(d) ? `tel:+34${d}` : undefined;
}

export function mailHref(valor?: string | null): string | undefined {
  const v = (valor || '').trim();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? `mailto:${v}` : undefined;
}

/** Solo permite enlaces http(s) (evita javascript: en datos de terceros). */
export function urlSegura(valor?: string | null): string | undefined {
  const v = (valor || '').trim();
  return /^https?:\/\//i.test(v) ? v : undefined;
}
