// Stijlronde: uitsluitend gewijzigde pagina's (incl. clientdata) en hun L7-hubs.
// Geen nieuwe broncontrole: publicatie- en controledatums blijven staan.
const RELEASE_DATE = '2026-11-18';
const PADEN = new Set([
  "/bankkoppeling-boekhoudprogramma/",
  "/blog/bewaarplicht-administratie-zzp/",
  "/blog/boekhouden-als-zzper/",
  "/blog/boekhoudprogramma-peppol/",
  "/blog/btw-aangifte-doen-zzp/",
  "/blog/schijnzelfstandigheid-2027-zzp/",
  "/blog/voorlopige-aanslag-zzp/",
  "/blog/wat-kost-een-boekhoudprogramma/",
  "/blog/zakelijke-rekening-zzp/",
  "/boekhoudprogramma-eenmanszaak/",
  "/boekhoudprogramma-starters/",
  "/boekhoudprogramma-vof/",
  "/btw-aangifte-boekhoudprogramma/",
  "/e-boekhouden/",
  "/gratis-boekhoudprogramma/",
  "/jortt-vs-moneymonk/",
  "/jortt/",
  "/kor-boekhoudprogramma/",
  "/moneybird-vs-e-boekhouden/",
  "/moneymonk/",
  "/urenregistratie-zzp/",
  "/voorschotfactuur-maken/"
]);
const updatedTime = /((?:[Ll]aatst\s+)?(?:[Bb]ijgewerkt|[Uu]pdated)(?:\s+(?:op|on))?\s*:?\s*)(<time\b[^>]*datetime=")[^"]+("[^>]*>)[^<]*(<\/time>)/g;
const updatedText = /((?:[Ll]aatst\s+)?(?:[Bb]ijgewerkt|[Uu]pdated)(?:\s+(?:op|on))?\s*:?\s*)(?:\d{4}-\d{2}-\d{2}|\d{1,2}\s+[A-Za-z]+\s+\d{4})/g;
export function nuchterDatum(p) {
  if (!PADEN.has(p.path)) return p;
  // Een releasevloer, geen datumplafond: latere pagina-updates blijven behouden.
  const UPD = [RELEASE_DATE, p.updated, p.lastmod, p.stamp?.updated, p.article?.updated, ...(p.schema || []).map((x) => x.dateModified)].filter((d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().at(-1);
  const DATUM = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Amsterdam' }).format(new Date(UPD + 'T12:00:00Z'));
  let body = p.body.replace(updatedTime, (_, label, open, close, end) => `${label}${open}${UPD}${close}${DATUM}${end}`).replace(updatedText, (_, label) => `${label}${DATUM}`);
  const hasUpdated = /(?:bijgewerkt|updated)\s*(?:op\s*|on\s*)?(?::\s*)?(?:<time|\d)/i.test(body);
  if (p.full && !hasUpdated) body = body.replace(/<\/h1>/, `$&<p class="stamp">Laatst bijgewerkt <time datetime="${UPD}">${DATUM}</time></p>`);
  return { ...p, body, updated: UPD, lastmod: UPD, stamp: { ...p.stamp, updated: UPD },
    ...(p.article ? { article: { ...p.article, updated: UPD } } : {}),
    ...(p.schema ? { schema: p.schema.map((x) => ('dateModified' in x ? { ...x, dateModified: UPD } : x)) } : {}) };
}
