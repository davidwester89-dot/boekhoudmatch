// Btw rekenen: van exclusief naar inclusief en terug. Afronding op centen per bedrag.
const r2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;
export function btwVanExcl(excl, tarief) {
  const btw = r2(excl * tarief);
  return { excl: r2(excl), btw, incl: r2(r2(excl) + btw) };
}
export function btwVanIncl(incl, tarief) {
  const excl = r2(incl / (1 + tarief));
  return { excl, btw: r2(incl - excl), incl: r2(incl) };
}
