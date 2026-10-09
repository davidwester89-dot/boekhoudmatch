const eur0 = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const eur2 = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num0 = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 0 });
const num1 = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 1 });
export const euro = (x) => (Number.isFinite(x) ? eur0.format(Math.round(x)) : '–');
export const euro2 = (x) => (Number.isFinite(x) ? eur2.format(x) : '–');
export const cent = (x) => (Number.isFinite(x) ? `${num1.format(x * 100)} ct` : '–');
export const kwh = (x) => (Number.isFinite(x) ? `${num0.format(x)} kWh` : '–');
export const pct = (x) => (Number.isFinite(x) ? `${num0.format(x * 100)}%` : '–');
export const getal = (x, d = 0) => (Number.isFinite(x) ? new Intl.NumberFormat('nl-NL', { maximumFractionDigits: d }).format(x) : '–');
/** Lees een Nederlands of Engels getal uit een invoerveld ("1.234,56" of "1234.56"). */
export function parseNum(v) {
  if (typeof v === 'number') return v;
  let s = String(v ?? '').trim().replace(/\s|€|%/g, '');
  if (s === '') return NaN;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s) && !s.startsWith('0.')) s = s.replace(/\./g, ''); // "2.500" = 2500
  return Number(s);
}
