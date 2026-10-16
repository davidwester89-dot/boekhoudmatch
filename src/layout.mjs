import { readFileSync } from 'node:fs';
import { GA_ID as GA_CONFIG } from './analytics.config.mjs';
import { GA_ID_RE } from './lib/consent.js';
import { networkFor } from './network.mjs';

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

// Eén iconenset: lijn-iconen in Lucide-stijl (24px, lijn 2, ronde uiteinden; Lucide is MIT). Inline SVG, kleur via currentColor.
const ic = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
export const ICONS = {
  match: ic('<path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>'),
  compare: ic('<path d="M4 6h16M4 12h16M4 18h10"/>'),
  netto: ic('<circle cx="12" cy="12" r="8"/><path d="M14.5 9.5a3 3 0 1 0 0 5M8.5 11h5M8.5 13h5"/>'),
  uur: ic('<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>'),
  btw: ic('<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>'),
  factuur: ic('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>'),
  blog: ic('<path d="M5 4h14v16H5z"/><path d="M9 8h6M9 12h6M9 16h4"/>'),
  kalender: ic('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
  bron: ic('<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>'),
  schild: ic('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>'),
  gratis: ic('<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 12 0v1"/><path d="M17 11l2 2 4-4"/>'),
  persoon: ic('<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>'),
  bon: ic('<path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M9 7h6M9 11h6M9 15h3"/>'),
  bank: ic('<path d="M3 10l9-6 9 6"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18"/>'),
  extra: ic('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/>'),
  aangifte: ic('<path d="M9 3h6l1 2h3v16H5V5h3z"/><path d="M9 12l2 2 4-4"/>'),
  euro: ic('<path d="M17 6.5A7 7 0 1 0 17 17.5"/><path d="M4 10h9M4 14h9"/>'),
  zon: ic('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>'),
};

const NAV = [
  ['/boekhoudprogramma-kiezen/', 'Start de match', 'nav-cta'],
  ['/boekhoudprogramma-vergelijken/', 'Vergelijken'],
  ['/gidsen/', 'Gidsen'],
  ['/zzp-netto-inkomen/', 'Netto-inkomen'],
  ['/zzp-uurtarief/', 'Uurtarief'],
  ['/btw-berekenen/', 'Btw'],
  ['/offerte-factuur-maken/', 'Factuur'],
  ['/blog/', 'Blog'],
];

// Desktop: menu in de header. Mobiel (<900px): knop 'Menu' (details/summary, werkt zonder JavaScript) met alle links.
const navLinks = (navPath) => NAV.map(([h, t, c]) => `<a href="${h}"${c ? ` class="${c}"` : ''}${navPath.startsWith(h) ? ' aria-current="page"' : ''}>${esc(t)}</a>`).join('');

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
    siteGraph(),
    ...(p.schema || []),
  ];
  const og = `${SITE.domain}/og/${p.og || 'home'}.png`;
  const navPath = p.navPath || p.path;
  const hasBar = p.body.includes('class="mobilebar"');
  // Vaste mobiele knop naar de match (niet op de match zelf, niet op pagina's met een eigen uitkomstbalk).
  const hasCta = !hasBar && !p.noCta && p.path !== '/boekhoudprogramma-kiezen/' && p.path !== '/404.html';
  const bodyCls = [hasBar && 'has-bar', hasCta && 'has-cta'].filter(Boolean).join(' ');
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
<meta property="og:image" content="${og}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(p.ogAlt || p.ogTitle || p.h1 || p.title)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(p.ogTitle || p.title)}"><meta name="twitter:description" content="${esc(p.description)}"><meta name="twitter:image" content="${og}">
${p.article ? `<meta property="article:published_time" content="${p.article.date}"><meta property="article:modified_time" content="${p.article.updated}">` : ''}
<meta name="theme-color" content="${SITE.theme}">
<link rel="icon" href="/favicon.ico" sizes="32x32"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest">
<link rel="alternate" type="application/rss+xml" title="BoekhoudMatch blog" href="/blog/feed.xml">
<link rel="preload" href="/fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin>
<style>${CSS}</style>
${ld.map((x) => `<script type="application/ld+json">${JSON.stringify(x).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body${bodyCls ? ` class="${bodyCls}"` : ''}${GA_ID ? ` data-ga="${GA_ID}"` : ''}>
<a class="skip" href="#inhoud">Naar de inhoud</a>
<header class="site"><div class="wrap">
<a class="logo" href="/" aria-label="${SITE.name}, naar de homepage">${LOGO}<span>Boekhoud<b>Match</b></span></a>
<nav class="main" aria-label="Hoofdmenu">${navLinks(navPath)}</nav>
<details class="menu"><summary><span class="burger" aria-hidden="true"></span><span class="menu-txt">Menu</span></summary><nav aria-label="Hoofdmenu">${navLinks(navPath)}</nav></details>
</div></header>
<main id="inhoud"><div class="wrap">
${crumbs}
${withStamp(p.body, p.stamp).replace('{{related}}', relatedPosts(p.path))}
${foutGezien(url)}
</div></main>
<footer class="site"><div class="wrap">
<div class="cols">
<div><a class="logo" href="/">${LOGO}<span>Boekhoud<b>Match</b></span></a><p>Eerlijke hulp bij boekhouding en belasting voor zzp'ers.</p></div>
<div><p class="fh">Tools</p><ul><li><a href="/boekhoudprogramma-kiezen/">Boekhoudprogramma kiezen</a></li><li><a href="/boekhoudprogramma-vergelijken/">Boekhoudprogramma's vergelijken</a></li><li><a href="/zzp-netto-inkomen/">Netto-inkomen zzp</a></li><li><a href="/zzp-uurtarief/">Uurtarief berekenen</a></li><li><a href="/btw-berekenen/">Btw berekenen</a></li><li><a href="/offerte-factuur-maken/">Offerte en factuur maken</a></li></ul></div>
<div><p class="fh">Gidsen</p><ul><li><a href="/beste-boekhoudprogramma-zzp/">Beste boekhoudprogramma zzp</a></li><li><a href="/gratis-boekhoudprogramma/">Gratis boekhoudprogramma</a></li><li><a href="/boekhoudprogramma-starters/">Voor starters</a></li><li><a href="/boekhoudprogramma-eenmanszaak/">Voor een eenmanszaak</a></li><li><a href="/boekhoudprogramma-bv/">Voor een bv</a></li><li><a href="/btw-aangifte-boekhoudprogramma/">Btw-aangifte</a></li><li><a href="/gidsen/">Alle gidsen</a></li></ul></div>
<div><p class="fh">Over ons</p><ul><li><a href="/blog/">Blog</a></li><li><a href="/over/">Over BoekhoudMatch</a></li><li><a href="/bronnen/">Bronnen en cijfers</a></li><li><a href="/privacy/">Privacy</a></li>${GA_ID ? '<li><a href="/privacy/#cookies" data-consent-open>Cookie-instellingen</a></li>' : ''}<li><a href="/disclaimer/">Disclaimer</a></li><li><a href="mailto:${SITE.email}">Contact</a></li></ul></div>
</div>
<div class="net"><p class="fh">Ook van ons</p><ul>${networkFor('boekhoudmatch.nl').map((s) => `<li><a href="${s.url}">${s.logo}</a> · ${esc(s.wat)}</li>`).join('')}</ul></div>
<p class="fine">© 2026 ${SITE.name}. Uitkomsten zijn een indicatie, geen persoonlijk advies. Partnerlinks hebben nooit invloed op de volgorde.</p>
</div></footer>
${hasCta ? `<a class="stickycta" href="/boekhoudprogramma-kiezen/" data-cta="sticky_match">${ICONS.match}<span>Bekijk jouw match in 2 minuten</span></a>` : ''}
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
// Wie erachter zit: het team van BoekhoudMatch (zie /over/). Auteur in JSON-LD = de organisatie.
export const FOUNDER = {
  naam: 'het team van BoekhoudMatch',
  zin: 'Ons team controleert elke maand de prijzen op de prijspagina\'s van de aanbieders.',
  schema: { '@type': 'Organization', name: 'BoekhoudMatch', url: 'https://boekhoudmatch.nl/' },
};
// De methode, kort. Staat boven de vergelijking, op /over/ en bij de match.
export const METHODE_LIJST = `<ul class="method">
<li><strong>Prijzen van de aanbieder zelf</strong>, met bronlink en controledatum.</li>
<li><strong>Niets zelf ingevuld.</strong> Noemt de aanbieder iets niet, dan staat er “niet vermeld”.</li>
<li><strong>Vaste volgorde:</strong> eerst wat past, dan je budget, dan de prijs.</li>
<li><strong>Commissie telt nooit mee.</strong></li>
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

// "Volgende stap" onder tools: altijd de match en de vergelijking, plus relevante gidsen ([tekst, url]).
export function volgendeStap(extra = []) {
  const items = [['Doe de match (8 vragen)', '/boekhoudprogramma-kiezen/'], ['Vergelijk alle boekhoudpakketten', '/boekhoudprogramma-vergelijken/'], ...extra];
  return `<aside class="cta"><h2>Volgende stap</h2><ul>${items.map(([t, u]) => `<li><a href="${u}">${esc(t)} →</a></li>`).join('')}</ul></aside>`;
}

/** Organization + WebSite op elke pagina (één graaf, met vaste @id's). */
export function siteGraph() {
  return { '@context': 'https://schema.org', '@graph': [
    { ...ORG, '@id': SITE.domain + '/#org' },
    { '@type': 'WebSite', '@id': SITE.domain + '/#website', name: SITE.name, url: SITE.domain + '/', inLanguage: 'nl-NL', publisher: { '@id': SITE.domain + '/#org' } },
  ] };
}

/** Badge 'Gecontroleerd op' + 'Laatst bijgewerkt' (alleen echte datums uit de data; ontbreekt er een, dan tonen we die niet). */
export function stampHtml(stamp) {
  if (!stamp || (!stamp.checked && !stamp.updated)) return '';
  const t = (d) => `<time datetime="${d}">${fmtDate(d)}</time>`;
  return `<p class="stamp">${stamp.checked ? `<span class="badge-ok">${ICONS.schild}Gecontroleerd op ${t(stamp.checked)}</span>` : ''}${stamp.updated ? `<span class="upd">Laatst bijgewerkt ${t(stamp.updated)}</span>` : ''}</p>`;
}
/** Zet de badge direct onder de h1 (en onder de auteursregel als die er staat). */
export function withStamp(body, stamp) {
  const html = stampHtml(stamp);
  if (!html) return body;
  const m = body.match(/<\/h1>\s*(<p class="lead">[\s\S]*?<\/p>\s*)?(<p class="post-meta">[\s\S]*?<\/p>)?/);
  if (!m) return html + body;
  const end = m.index + m[0].length;
  return body.slice(0, end) + '\n' + html + body.slice(end);
}
/** 'Fout gezien?': mailto met de pagina-URL al ingevuld. */
export function foutGezien(url) {
  const q = `subject=${encodeURIComponent(`Fout gezien op ${url.replace(/^https?:\/\//, '')}`)}&body=${encodeURIComponent(`Pagina: ${url}\n\nWat klopt er niet?\n`)}`;
  return `<p class="report">Fout gezien? <a href="mailto:${SITE.email}?${q}" data-cta="report_error">Laat het ons weten</a>.</p>`;
}
/** Echte FAQ's uit een artikel: de h3-vragen onder een h2 'Veelgestelde vragen' (tot de volgende h2). */
export function faqFromHtml(html) {
  const m = html.match(/<h2[^>]*>\s*Veelgestelde vragen\s*<\/h2>([\s\S]*?)(?=<h2|$)/i);
  if (!m) return [];
  const strip = (x) => x.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return [...m[1].matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3|$)/g)].map(([, q, a]) => [strip(q), strip(a)]).filter(([q, a]) => q && a);
}
