// Oude URL's (vorige site, feb. 2025) → beste nieuwe pagina. GitHub Pages kent geen
// server-side redirects, dus build.mjs schrijft per oude URL een kleine HTML-pagina met
// meta refresh (0 s), canonical, JS-fallback, zichtbare link en noindex.
// Deze pagina's staan bewust NIET in sitemap.xml (check.mjs controleert dat).
import { SITE, esc } from './layout.mjs';

export const REDIRECTS = [
  // Algemene uitleg voor beginners → blog (redactionele hub). Retarget naar een beginnersartikel zodra dat er is.
  { from: '/wat-is-boekhouden-een-simpel-overzicht-van-wat-je-moet-weten/', to: '/blog/', label: 'de blog over boekhouding en belasting voor zzp\'ers' },
  // Waarom een goed boekhoudpakket belangrijk is → keuzehulp voor een boekhoudprogramma.
  { from: '/waarom-is-een-goed-boekhoudpakket-belangrijk/', to: '/boekhoudprogramma-kiezen/', label: 'de keuzehulp voor een boekhoudprogramma' },
];

export function redirectPage({ to, label }) {
  const url = SITE.domain + to;
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Deze pagina is verhuisd | ${SITE.name}</title>
<meta name="description" content="Deze pagina is verhuisd. Je wordt doorgestuurd naar ${esc(label)} op ${SITE.name}.">
<meta name="robots" content="noindex">
<link rel="canonical" href="${url}">
<meta http-equiv="refresh" content="0; url=${url}">
<meta property="og:image" content="${SITE.domain}/og/home.png">
<script>location.replace(${JSON.stringify(url)});</script>
</head>
<body>
<h1>Deze pagina is verhuisd</h1>
<p>Ga verder naar <a href="${to}">${esc(label)}</a>.</p>
</body>
</html>
`;
}
