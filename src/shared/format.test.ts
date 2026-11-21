import { formatDate, formatMoney as fm } from './format';

// Intl usa espacios de no separación (U+00A0 / U+202F) entre símbolo y número.
const formatMoney = (...a: Parameters<typeof fm>) => fm(...a).replace(/[\u00a0\u202f]/g, ' ');

describe('formato regional', () => {
  it('montos con separador de miles, 2 decimales y símbolo de moneda', () => {
    expect(formatMoney(6670.35, 'USD', 'es-419')).toBe('USD 6,670.35');
    expect(formatMoney(45, 'USD', 'es-419')).toBe('USD 45.00');
    expect(formatMoney(-23.5, 'USD', 'es-419')).toBe('-USD 23.50');
  });

  it('fechas de calendario no se corren por zona horaria', () => {
    expect(formatDate('2026-12-05', 'es-419')).toBe('5 dic 2026');
  });
});
