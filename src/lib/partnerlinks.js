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

/** CTA-tekst voor een pakket: "Probeer X gratis" als de aanbieder een gratis proefperiode noemt of het pakket gratis is. */
export function ctaTekst(kort, { proef, prijs }) {
  const gratis = (Number(proef) > 0) || prijs === 0;
  return { gratis, tekst: gratis ? `Probeer ${kort} gratis` : `Bekijk ${kort}`, uitleg: Number(proef) > 0 ? `${proef} dagen gratis proberen, volgens ${kort}` : prijs === 0 ? 'Dit pakket is gratis' : '' };
}
