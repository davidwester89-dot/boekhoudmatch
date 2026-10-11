// Goedgekeurde partnerlinks per aanbieder-id. Leeg = nergens een partnerlink; dan linken we gewoon naar de site van de aanbieder.
// Alleen invullen als het partnerprogramma de link echt heeft goedgekeurd. Vorm: { url: 'https://…', netwerk: 'Daisycon' }.
// De match en de volgorde lezen dit bestand NOOIT (zie test/cta.test.js). Een partnerlink krijgt altijd het label "partnerlink"
// en rel="nofollow sponsored noopener".
export const PARTNERLINKS = {};

/** Uitgaande link naar een aanbieder: partnerlink als die er is, anders de eigen site. */
export function uitgaand(aanbieder, partnerlinks = PARTNERLINKS) {
  const pl = partnerlinks[aanbieder.id];
  const partner = !!(pl && /^https:\/\//.test(pl.url));
  return { href: partner ? pl.url : aanbieder.site, partner, rel: partner ? 'nofollow sponsored noopener' : 'nofollow noopener' };
}

/** CTA-tekst voor een pakket: de proefperiode (volgens de aanbieder) staat in de knop zelf, zodat er geen regel onder hoeft. */
export function ctaTekst(kort, { proef, prijs }) {
  const dagen = Number(proef) > 0 ? Number(proef) : 0;
  const gratis = dagen > 0 || prijs === 0;
  return { gratis, tekst: dagen ? `${dagen} dagen gratis proberen bij ${kort}` : prijs === 0 ? `Gratis beginnen bij ${kort}` : `Bekijk ${kort}` };
}
