// Quiz-antwoorden bewaren op het eigen apparaat (localStorage), zonder account en zonder dat er iets naar ons gaat.
// Bewaard wordt alleen de querystring met de antwoorden, en alleen velden die in de quiz bestaan.

/** Querystring opschonen: alleen toegestane velden, korte waarden. */
export function schoon(search, allowed) {
  const inn = new URLSearchParams(String(search || '').replace(/^\?/, '')), uit = new URLSearchParams();
  for (const [k, v] of inn) if (allowed.includes(k) && v.length <= 20 && /^[\w.,-]*$/.test(v)) uit.set(k, v);
  return uit.toString();
}
export function bewaar(storage, key, search, allowed) {
  const q = schoon(search, allowed);
  try { if (q) storage.setItem(key, JSON.stringify({ q, t: Date.now() })); } catch { /* opslag uit of vol */ }
  return q;
}
/** Bewaarde antwoorden (max. 90 dagen oud), of '' als er niets is. */
export function laad(storage, key, allowed, now = Date.now()) {
  try {
    const x = JSON.parse(storage.getItem(key) || 'null');
    if (!x || typeof x.q !== 'string' || !(now - x.t < 90 * 864e5)) return '';
    return schoon(x.q, allowed);
  } catch { return ''; }
}
export function wis(storage, key) { try { storage.removeItem(key); } catch { /* niets */ } }
