// Gedeelde weergave van pakketdata (vergelijking, aanbiederpagina's, money-pagina's). Alleen opmaak, geen nieuwe feiten.
import { esc, fmtDate, SITE } from '../layout.mjs';
import { PAKKETTEN, CHECKED } from './pakketten.js';
import { REDACTIE } from './aanbieders.js';

export const e2 = (x) => '€ ' + x.toFixed(2).replace('.', ',');
export const UNK = '<span class="unk">niet vermeld</span>';
const lim = (x, unit) => (x === undefined ? '' : x === Infinity ? `onbeperkt ${unit}` : x === 0 ? `geen ${unit}` : `max. ${x} ${unit}`);
export const BTW_L = { direct: 'Ja, direct indienen', ja: 'Ja (manier van indienen niet vermeld)', handmatig: 'Berekenen, zelf indienen', overzicht: 'Alleen overzicht', boekhouder: 'Via boekhouder', false: 'Nee' };
export const IB_L = { inclusief: 'Boekhouder doet IB', controle: 'Gecontroleerde IB-aangifte', rapportage: 'Overzicht voor IB, zelf invullen', 'eigen-boekhouder': 'Via eigen boekhouder', false: 'Nee' };
export const yn = (v) => (v === true ? 'Ja' : v === false ? 'Nee' : v === 'beperkt' ? 'Beperkt' : UNK);
export const ibL = (p) => (p.ib === null || p.ib === undefined ? UNK : IB_L[String(p.ib)]);
export const bankL = (p, a) => (p.bank === 'auto' ? 'Automatisch' : p.bank === 'auto-extra' ? `Automatisch (+ ${e2(p.bankExtra)} p/m)` : `Handmatig importeren${a.eigenRekening ? '; automatisch met eigen rekening aanbieder' : ''}`);
export const rvL = (p, a) => { const rv = p.rechtsvormen ?? a.rechtsvormen; return rv ? rv.join(', ') : UNK; };
export const limieten = (p) => [
  p.facturen !== undefined ? lim(p.facturen, 'facturen/mnd') : '', p.perFactuur ? `${e2(p.perFactuur)} per factuur` : '',
  lim(p.uitgaven, 'uitgaven/mnd'), lim(p.transacties, 'banktransacties/mnd'), lim(p.boekingenMaand, 'boekingen/mnd'), lim(p.boekingenJaar, 'boekingen/jaar'),
  p.omzetMax ? `omzet tot € ${p.omzetMax.toLocaleString('nl-NL')}/jaar` : '',
  p.boekhouding === false ? '<strong>geen boekhouding</strong>' : '', p.viaBoekhouder ? 'voor samenwerking met boekhouder' : '',
].filter(Boolean).filter((s) => !s.startsWith('onbeperkt') || s.includes('facturen')).join('<br>') || 'geen limiet vermeld';
export const checked = (a) => a.gecontroleerd || CHECKED;
export const btwNoot = (a) => (a.btwPrijzen === 'excl' ? 'excl. btw' : 'btw niet vermeld');
/** Goedkoopste pakket mét boekhouding (voor "vanaf"-prijs). */
export const vanaf = (a) => [...a.plannen].filter((p) => p.boekhouding !== false).sort((x, y) => x.prijs - y.prijs)[0];
export const bronLinks = (a, sep = ' · ') => a.bronnen.map((b) => `<a href="${b.url}" rel="noopener" data-vendor="${esc(a.naam)}">${esc(b.titel)}</a>`).join(sep);
export const N_AANB = PAKKETTEN.length;
export const N_PAK = PAKKETTEN.reduce((n, a) => n + a.plannen.length, 0);
export const ALFA = [...PAKKETTEN].sort((x, y) => x.naam.localeCompare(y.naam, 'nl'));
export const byId = Object.fromEntries(PAKKETTEN.map((a) => [a.id, a]));

/** priceValidUntil = controledatum + 3 maanden (we controleren maandelijks). */
export function geldigTot(iso) { const d = new Date(iso + 'T00:00:00Z'); d.setUTCMonth(d.getUTCMonth() + 3); return d.toISOString().slice(0, 10); }

/** Schema.org SoftwareApplication met één Offer per pakket. Geen beoordelingen. */
export function softwareSchema(a, url) {
  const c = checked(a);
  return {
    '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: a.naam, url: a.site, applicationCategory: 'BusinessApplication', applicationSubCategory: 'Boekhoudsoftware', operatingSystem: 'Web',
    dateModified: c, ...(url ? { mainEntityOfPage: url } : {}),
    offers: a.plannen.map((p) => ({ '@type': 'Offer', name: `${a.naam} ${p.naam}`, price: p.prijs.toFixed(2), priceCurrency: 'EUR', priceValidUntil: geldigTot(c), url: a.bronnen[0].url,
      priceSpecification: { '@type': 'UnitPriceSpecification', price: p.prijs.toFixed(2), priceCurrency: 'EUR', unitText: 'maand', ...(a.btwPrijzen === 'excl' ? { valueAddedTaxIncluded: false } : {}) } })),
  };
}

/** Pakkettabel voor één aanbieder. */
export function pakketTabel(a) {
  // Pakketkaarten: de belangrijkste feiten zichtbaar, de rest in "Alle details". Geen horizontale scroll, ook niet op mobiel.
  const rij = (k, v) => `<dt>${k}</dt><dd>${v}</dd>`;
  const kaart = (p) => `<article class="pkg-card">
<h3>${esc(p.naam)}</h3>
<p class="pkg-price"><strong>${e2(p.prijs)}</strong> <span>p/m, ${btwNoot(a)}</span></p>
<p class="pkg-year">Bij jaarbetaling: ${p.prijsJaar != null ? `${e2(p.prijsJaar)} p/m` : UNK}</p>
<dl class="pkg-facts">${rij('Limiet', limieten(p))}${rij('Btw-aangifte', BTW_L[String(p.btwAangifte)])}${rij('Bankkoppeling', bankL(p, a))}</dl>
<details class="pkg-more"><summary>Alle details</summary><dl class="pkg-facts">${rij('Offertes', yn(p.offertes))}${rij('Uren', yn(p.uren))}${rij('Aangifte IB', ibL(p))}${rij('Rechtsvorm', rvL(p, a))}${p.noot ? rij('Noot', esc(p.noot)) : ''}</dl></details>
</article>`;
  return `<ul class="pkg-grid" aria-label="Pakketten ${esc(a.naam)}">${a.plannen.map((p) => `<li>${kaart(p)}</li>`).join('')}</ul>
<p class="sub">Maandprijs bij maandbetaling, ${btwNoot(a)}.</p>`;
}

/** Logo of woordmerk, vaste afmetingen. */
export function logo(a, lazy = true) {
  const r = REDACTIE[a.id];
  return r.logo ? `<img src="/logos/${r.logo}.webp" width="160" height="48" alt="${esc(a.naam)}"${lazy ? ' loading="lazy"' : ''} decoding="async">` : `<span class="wordmark">${esc(r.kort)}</span>`;
}
export { SITE };
