import { readFileSync } from 'node:fs';
import { GA_ID as GA_CONFIG } from './analytics.config.mjs';
import { GA_ID_RE } from './lib/consent.js';

// Google Analytics: Metings-ID uit src/analytics.config.mjs (GA_ID=... als omgevingsvariabele overschrijft, voor lokaal testen).
export const GA_ID = (process.env.GA_ID ?? GA_CONFIG).trim();
if (GA_ID && !GA_ID_RE.test(GA_ID)) throw new Error(`Ongeldige GA_ID "${GA_ID}" (verwacht G-XXXXXXXXXX)`);
// Content-Security-Policy: Google-domeinen alleen als Analytics aanstaat (gtag.js laadt pas na toestemming).
const G = GA_ID ? { script: ' https://www.googletagmanager.com', connect: ' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com', img: ' https://*.google-analytics.com https://www.googletagmanager.com' } : { script: '', connect: '', img: '' };

export const SITE = {
  name: 'BoekhoudMatch',
  domain: 'https://boekhoudmatch.nl',
  email: 'info@boekhoudmatch.nl',
  lang: 'nl',
  showSlots: process.env.SHOW_SLOTS !== '0', // partnerplekken alleen zichtbaar in een lokale preview
  updated: '2026-10-10',
  theme: '#b44d22',
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export { esc };

// Logo: warm terracotta vlak met een vinkje (match) en een amber stip.
export const LOGO = '<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><rect width="40" height="40" rx="11" fill="#b44d22"/><path d="M11 21.5l6 6 12-13" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="31" cy="9" r="4" fill="#e7a33e"/></svg>';

// Kleine lijn-iconen (inline SVG, geen extra verzoeken).
const ic = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="#9c3f1b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
export const ICONS = {
  match: ic('<path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>'),
  compare: ic('<path d="M4 6h16M4 12h16M4 18h10"/>'),
  netto: ic('<circle cx="12" cy="12" r="8"/><path d="M14.5 9.5a3 3 0 1 0 0 5M8.5 11h5M8.5 13h5"/>'),
  uur: ic('<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>'),
  btw: ic('<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>'),
  factuur: ic('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>'),
  blog: ic('<path d="M5 4h14v16H5z"/><path d="M9 8h6M9 12h6M9 16h4"/>'),
  zon: ic('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>'),
};

const NAV = [
  ['/boekhoudprogramma-kiezen/', 'Boekhoudmatch'],
  ['/boekhoudprogramma-vergelijken/', 'Vergelijken'],
  ['/zzp-netto-inkomen/', 'Netto inkomen'],
  ['/zzp-uurtarief/', 'Uurtarief'],
  ['/btw-berekenen/', 'Btw'],
  ['/offerte-factuur-maken/', 'Factuur'],
  ['/blog/', 'Blog'],
];

const CSS = readFileSync(new URL('./assets/css/style.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '').replace(/\s*([{};:,>])\s*/g, '$1').replace(/;}/g, '}');

export function slot(id, what) {
  if (!SITE.showSlots) return '';
  return `<aside class="slot" data-slot="${esc(id)}">Preview: ${what}</aside>`;
}

export function layout(p) {
  const url = SITE.domain + (p.path === '/404.html' ? '/' : p.path);
  const trail = p.path === '/' || p.path === '/404.html' ? [] : [['/', 'Home'], ...(p.parents || []), [p.path, p.crumb || p.h1 || p.title]];
  const crumbs = trail.length ? `<nav class="crumbs" aria-label="Kruimelpad">${trail.map(([h, t], i) => (i === trail.length - 1 ? `<span aria-current="page">${esc(t)}</span>` : `<a href="${h}">${esc(t)}</a>`)).join(' › ')}</nav>` : '';
  const ld = [
    ...(trail.length ? [{
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: trail.map(([h, t], i) => ({ '@type': 'ListItem', position: i + 1, name: t, item: SITE.domain + h })),
    }] : []),
    ...(p.schema || []),
  ];
  const og = `${SITE.domain}/og/${p.og || 'home'}.png`;
  const navPath = p.navPath || p.path;
  const hasBar = p.body.includes('class="mobilebar"');
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${p.path === '/' ? '<meta name="e08923fead07e26" content="c805cc3c2262098e1a99fce841da04b0" />' : ''}
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'${G.script}; style-src 'self' 'unsafe-inline'; img-src 'self' data:${G.img}; connect-src 'self'${G.connect}; base-uri 'self'; form-action 'self'; object-src 'none'">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
${p.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`}
<meta property="og:site_name" content="${SITE.name}"><meta property="og:locale" content="nl_NL"><meta property="og:type" content="${p.ogType || 'website'}">
<meta property="og:title" content="${esc(p.ogTitle || p.title)}"><meta property="og:description" content="${esc(p.description)}"><meta property="og:url" content="${url}">
<meta property="og:image" content="${og}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(p.ogTitle || p.h1 || p.title)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(p.ogTitle || p.title)}"><meta name="twitter:description" content="${esc(p.description)}"><meta name="twitter:image" content="${og}">
${p.article ? `<meta property="article:published_time" content="${p.article.date}"><meta property="article:modified_time" content="${p.article.updated}">` : ''}
<meta name="theme-color" content="${SITE.theme}">
<link rel="icon" href="/favicon.ico" sizes="32x32"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest">
<link rel="alternate" type="application/rss+xml" title="BoekhoudMatch blog" href="/blog/feed.xml">
<style>${CSS}</style>
${ld.map((x) => `<script type="application/ld+json">${JSON.stringify(x).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body${hasBar ? ' class="has-bar"' : ''}${GA_ID ? ` data-ga="${GA_ID}"` : ''}>
<a class="skip" href="#inhoud">Naar de inhoud</a>
<header class="site"><div class="wrap">
<a class="logo" href="/" aria-label="${SITE.name}, naar de homepage">${LOGO}<span>Boekhoud<b>Match</b></span></a>
<nav class="main" aria-label="Hoofdmenu">${NAV.map(([h, t]) => `<a href="${h}"${navPath.startsWith(h) ? ' aria-current="page"' : ''}>${esc(t)}</a>`).join('')}</nav>
</div></header>
<main id="inhoud"><div class="wrap">
${crumbs}
${p.body.replace('{{related}}', relatedPosts(p.path))}
</div></main>
<footer class="site"><div class="wrap">
<div class="cols">
<div><a class="logo" href="/">${LOGO}<span>Boekhoud<b>Match</b></span></a><p>Eerlijke hulp bij boekhouding, geld en belasting voor zzp'ers. Echte prijzen, officiële cijfers. Alleen statistieken met jouw toestemming.</p></div>
<div><h2>Tools</h2><ul><li><a href="/boekhoudprogramma-kiezen/">Boekhoudprogramma kiezen</a></li><li><a href="/boekhoudprogramma-vergelijken/">Boekhoudprogramma's vergelijken</a></li><li><a href="/zzp-netto-inkomen/">Netto inkomen zzp</a></li><li><a href="/zzp-uurtarief/">Uurtarief berekenen</a></li><li><a href="/btw-berekenen/">Btw berekenen</a></li><li><a href="/offerte-factuur-maken/">Offerte en factuur maken</a></li></ul></div>
<div><h2>Over ons</h2><ul><li><a href="/blog/">Blog</a></li><li><a href="/over/">Over BoekhoudMatch</a></li><li><a href="/bronnen/">Bronnen en cijfers</a></li><li><a href="/privacy/">Privacy</a></li>${GA_ID ? '<li><a href="/privacy/#cookies" data-consent-open>Cookie-instellingen</a></li>' : ''}<li><a href="/disclaimer/">Disclaimer</a></li><li><a href="mailto:${SITE.email}">Contact</a></li></ul></div>
</div>
<p class="fine">© 2026 ${SITE.name}. Uitkomsten zijn indicaties, geen persoonlijk financieel of fiscaal advies. Cijfers gecontroleerd op ${fmtDate(SITE.updated)}.</p>
</div></footer>
${[...(GA_ID ? ['/js/consent.js'] : []), ...(p.scripts || [])].map((s) => `<script type="module" src="${s}"></script>`).join('\n')}
</body>
</html>`;
}

export function fmtDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const mnd = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
  return `${d} ${mnd[m - 1]} ${y}`;
}

export function field({ name, label, value, unit, hint, num = true, attrs = '' }) {
  return `<div class="field"><label for="f-${name}">${label}</label><div class="inline"><input type="text" inputmode="decimal" id="f-${name}" name="${name}" value="${esc(value)}"${num ? ' data-num' : ''} ${attrs}>${unit ? `<span class="unit">${unit}</span>` : ''}</div>${hint ? `<span class="hint">${hint}</span>` : ''}</div>`;
}
export function check({ name, label, checked }) {
  return `<label class="check"><input type="checkbox" name="${name}" id="f-${name}"${checked ? ' checked' : ''}> <span>${label}</span></label>`;
}
export function sourceList(keys, SOURCES) {
  return `<ul class="sources">${keys.map((k) => `<li><a href="${SOURCES[k].url}" rel="noopener">${esc(SOURCES[k].title)}</a></li>`).join('')}</ul>`;
}
/** Uitleg en bronnen inklappen, zodat de pagina kort en scanbaar blijft. */
export function more(summary, html) {
  return `<details><summary>${esc(summary)}</summary>${html}</details>`;
}
// Wie erachter zit: letterlijk zoals Dave het opgaf. Niets toevoegen.
export const FOUNDER = {
  naam: 'Dave West',
  zin: 'Dave West, oprichter. Controleert elke maand de prijzen op de prijspagina\'s van de aanbieders.',
  schema: { '@type': 'Person', name: 'Dave West', jobTitle: 'Oprichter', url: 'https://boekhoudmatch.nl/over/' },
};
// De methode, kort. Staat boven de vergelijking, op /over/ en bij de match.
export const METHODE_LIJST = `<ul class="method">
<li><strong>Prijs van de aanbieder zelf.</strong> Elke prijs komt van de prijspagina van de aanbieder, met de bronlink erbij.</li>
<li><strong>Met controledatum.</strong> Bij elke aanbieder staat wanneer we de prijs hebben gecontroleerd.</li>
<li><strong>“Niet vermeld” is niet vermeld.</strong> Staat iets niet op de pagina van de aanbieder, dan schrijven we “niet vermeld”. We vullen niets zelf in.</li>
<li><strong>Volgorde = passend + budget + prijs.</strong> Eerst wat bij je situatie past, dan wat binnen je budget valt, dan de laagste prijs.</li>
<li><strong>Commissie telt niet mee.</strong> Of wij ergens aan verdienen, heeft geen invloed op de volgorde.</li>
</ul>`;

export const ORG = {
  '@type': 'Organization', name: SITE.name, url: SITE.domain + '/',
  logo: { '@type': 'ImageObject', url: SITE.domain + '/icon-512.png', width: 512, height: 512 },
  email: SITE.email,
};
export function webApp({ name, url, description }) {
  return {
    '@context': 'https://schema.org', '@type': 'WebApplication', name, url, description,
    applicationCategory: 'FinanceApplication', operatingSystem: 'Any', inLanguage: 'nl-NL', browserRequirements: 'Requires JavaScript',
    isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }, publisher: ORG,
  };
}
export function faqSchema(items) {
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })) };
}
export function faqHtml(items) {
  return items.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${a}</p></details>`).join('\n');
}
/** "Lees ook" blok met blogartikelen die bij een tool horen (wordt in build.mjs gevuld). */
export const RELATED = { posts: [] };
export function relatedPosts(path, n = 2) {
  const list = RELATED.posts.filter((x) => x.tools.includes(path)).slice(0, n);
  if (!list.length) return '';
  return `<h2>Lees ook</h2><div class="grid cards two">${list.map((x) => `<a class="card" href="${x.path}"><span class="tag">Blog</span><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p></a>`).join('')}</div>`;
}
