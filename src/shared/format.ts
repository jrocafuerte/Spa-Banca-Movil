import { config } from '../core/config';

/**
 * Formato único de montos y fechas para toda la app (y enviado al micro frontend
 * en INIT.locale). La configuración regional es del BANCO (app.config.ts → locale),
 * no del dispositivo: los montos deben verse igual para todos los clientes.
 */
const money = new Map<string, Intl.NumberFormat>();

export function formatMoney(amount: number, currency: string, locale: string = config.locale): string {
  const key = `${locale}|${currency}`;
  let f = money.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    });
    money.set(key, f);
  }
  return f.format(amount);
}

/** Fechas de calendario (YYYY-MM-DD) se interpretan en UTC para no correrse un día por zona horaria. */
export function formatDate(value: string, locale: string = config.locale): string {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const d = new Date(dateOnly ? `${value}T12:00:00Z` : value);
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: dateOnly ? 'UTC' : undefined,
  }).format(d);
}

export function formatDateTime(value: string, locale: string = config.locale): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
