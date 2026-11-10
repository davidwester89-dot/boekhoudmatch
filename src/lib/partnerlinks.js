// Goedgekeurde partnerlinks per aanbieder-id. Leeg = nergens een partnerlink; dan linken we gewoon naar de site van de aanbieder.
// Alleen invullen als het partnerprogramma de link echt heeft goedgekeurd. Vorm: { url: 'https://…', netwerk: 'Daisycon' }.
// De match en de volgorde lezen dit bestand NOOIT (zie test/cta.test.js). Een partnerlink krijgt geen label per knop maar één partnerzin per blok (partnerNoten)
// en rel="nofollow sponsored noopener".
// Daisycon, media BoekhoudMatch 436745: Jortt.nl (16611) en Moneybird NL (19080) goedgekeurd 23-10-2026.
// Daisycon-trackinglink, deeplink /prijs/ (www.jortt.nl/prijs/).
export const JORTT_DAISYCON = 'https://jf79.net/c/?si=16611&li=1713658&wi=436745&ws=&dl=prijs%2F';
// Daisycon-trackinglink, homepage (geen deeplink mogelijk).
export const MONEYBIRD_DAISYCON = 'https://bdt9.net/c/?si=19080&li=1819984&wi=436745&ws=';
// Awin, publisher Matchchecker 3145721: e-Boekhouden.nl (mid 101519) goedgekeurd 5-11-2026.
// Awin-trackinglink, homepage (officiële link; geen zelfgemaakte deeplink).
export const EBOEKHOUDEN_AWIN = 'https://www.awin1.com/cread.php?awinmid=101519&awinaffid=3145721&ued=https%3A%2F%2Fwww.e-boekhouden.nl%2F';
export const PARTNERLINKS = {
  jortt: { url: JORTT_DAISYCON, netwerk: 'Daisycon' },
  moneybird: { url: MONEYBIRD_DAISYCON, netwerk: 'Daisycon' },
  eboekhouden: { url: EBOEKHOUDEN_AWIN, netwerk: 'Awin' },
};

// SnelStart (sinds Jortt v3), Informer en Exact: geen goedgekeurde betaalde partnerroute (besluit 10-11-2026). Geen CTA, geen sponsored/ref; gewone bronlink.
export const NEUTRALE_BRONNEN = {
  snelstart: { href: 'https://www.snelstart.nl', naam: 'SnelStart' },
  informer: { href: 'https://www.informer.nl', naam: 'Informer' },
  exact: { href: 'https://www.exact.com/nl', naam: 'Exact' },
};

/** Uitgaande link naar een aanbieder: partnerlink als die er is, anders de eigen site. SnelStart/Informer/Exact: neutrale bronlink. */
export function uitgaand(aanbieder, partnerlinks = PARTNERLINKS) {
  const pl = partnerlinks[aanbieder.id];
  const partner = !!(pl && /^https:\/\//.test(pl.url));
  const bron = !partner && !!NEUTRALE_BRONNEN[aanbieder.id];
  const href = partner ? pl.url : bron ? NEUTRALE_BRONNEN[aanbieder.id].href : aanbieder.site;
  const rel = partner ? 'nofollow sponsored noopener' : bron ? 'noopener' : 'nofollow noopener';
  return { href, partner, rel, bron };
}

/** CTA-tekst voor een pakket: de proefperiode (volgens de aanbieder) staat in de knop zelf, zodat er geen regel onder hoeft.
 *  SnelStart/Informer/Exact: 'Bron: <merk>'. Jortt (betaalde route): 'Bekijk Jortt' (proefmetadata niet als promo renderen, SC B3 punt 6). */
export function ctaTekst(kort, { proef, prijs, id } = {}) {
  if (id && NEUTRALE_BRONNEN[id]) return { gratis: false, tekst: `Bron: ${NEUTRALE_BRONNEN[id].naam}`, bron: true };
  if (id === 'jortt') return { gratis: false, tekst: 'Bekijk Jortt' };
  const dagen = Number(proef) > 0 ? Number(proef) : 0;
  const gratis = dagen > 0 || prijs === 0;
  return { gratis, tekst: dagen ? `${dagen} dagen gratis proberen bij ${kort}` : prijs === 0 ? `Gratis beginnen bij ${kort}` : `Bekijk ${kort}` };
}

/** Gewone bronlink zonder knopstyling, sponsored of target (vorm vastgelegd 10-11-2026). */
export function bronLinkHtml(id) {
  const b = NEUTRALE_BRONNEN[id];
  return b ? `<a href="${b.href}" rel="noopener">Bron: ${b.naam}</a>` : '';
}

// Partnerzin: geen label per knop, maar precies één korte zin direct na elk blok waarin een partnerlink staat
// (rel sponsored). Werkt automatisch: staat er geen partnerlink in een blok, dan komt er ook geen zin.
export const PARTNER_NOOT = 'Sommige links zijn partnerlinks; dat verandert de volgorde nooit.';
export const NOOT_HTML = `<p class="pnoot">${PARTNER_NOOT}</p>`;
const SPONSORED = /<a\s[^>]*rel="[^"]*\bsponsored\b/;
/** Eén blok als string: de zin erachter als er een partnerlink in staat. */
export const metNoot = (html) => (SPONSORED.test(html) ? html + NOOT_HTML : html);
/** Blokken (op class) met knoppen of links naar aanbieders. Het buitenste blok telt; binnen een blok komt geen tweede zin. */
export const BLOKKEN = ['vendor-out', 'match-cta', 'top'];
/** Begin en eind van elk blok in html (buitenste eerst), en of er een partnerlink in staat. kaal = ook <p>, <ul>, <ol> zonder class. */
export function partnerBlokken(html, { blokken = BLOKKEN, kaal = false } = {}) {
  const cls = `<(div|ol|ul|p|aside|section)\\s[^>]*class="(?:[^"]*\\s)?(?:${blokken.join('|')})(?:\\s[^"]*)?"[^>]*>`;
  const re = new RegExp(kaal ? `${cls}|<(p|ul|ol)>` : cls, 'g');
  const res = []; let m;
  while ((m = re.exec(html))) {
    const tag = m[1] || m[2];
    const t = new RegExp(`<${tag}\\b|</${tag}>`, 'g'); t.lastIndex = m.index;
    let d = 0, eind = -1, x;
    while ((x = t.exec(html))) { if (x[0][1] === '/') { if (--d === 0) { eind = x.index + x[0].length; break; } } else d++; }
    if (eind < 0) continue;
    res.push({ start: m.index, end: eind, partner: SPONSORED.test(html.slice(m.index, eind)) });
    re.lastIndex = eind;
  }
  return res;
}
/** Hele pagina: precies één zin direct na elk blok met een partnerlink. */
export function partnerNoten(html, opts) {
  let out = '', i = 0;
  for (const b of partnerBlokken(html, opts)) if (b.partner && !html.startsWith(NOOT_HTML, b.end)) { out += html.slice(i, b.end) + NOOT_HTML; i = b.end; }
  return out + html.slice(i);
}
