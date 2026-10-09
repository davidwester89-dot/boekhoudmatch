export const SITE = {
  name: 'BoekhoudMatch',
  nameHtml: 'Boekhoud<span>Match</span>',
  domain: 'https://boekhoudmatch.nl',
  email: 'davidwester89@gmail.com',
  lang: 'nl',
  showSlots: process.env.SHOW_SLOTS !== '0', // partnerplekken zichtbaar in preview
  updated: '2026-10-08',
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export { esc };

const NAV = [
  ['/boekhoudprogramma-kiezen/', 'Boekhoudmatch'],
  ['/boekhoudprogramma-vergelijken/', 'Vergelijken'],
  ['/zzp-netto-inkomen/', 'Zzp netto'],
  ['/zzp-uurtarief/', 'Uurtarief'],
  ['/btw-berekenen/', 'Btw'],
  ['/offerte-factuur-maken/', 'Offerte & factuur'],
];

export function slot(id, what) {
  if (!SITE.showSlots) return '';
  return `<aside class="slot" data-slot="${esc(id)}" aria-label="Partnerplek, nog niet actief"><strong>Partnerplek · nog niet actief</strong>${what} <em>Er staat hier bewust geen link tot het partnerprogramma is goedgekeurd.</em></aside>`;
}

export function layout(p) {
  const url = SITE.domain + p.path;
  const crumbs = p.path === '/' ? '' :
    `<div class="crumbs"><a href="/">Home</a> › ${esc(p.crumb || p.h1 || p.title)}</div>`;
  const ld = [
    { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, url: SITE.domain + '/', inLanguage: 'nl-NL' },
    ...(p.path === '/' ? [] : [{
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.domain + '/' },
        { '@type': 'ListItem', position: 2, name: p.crumb || p.h1 || p.title, item: url },
      ],
    }]),
    ...(p.schema || []),
  ];
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self'; object-src 'none'">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(p.title)}"><meta property="og:description" content="${esc(p.description)}"><meta property="og:url" content="${url}"><meta property="og:locale" content="nl_NL">
<meta name="theme-color" content="#0f6b5c">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/css/style.css">
${ld.map((x) => `<script type="application/ld+json">${JSON.stringify(x)}</script>`).join('\n')}
${p.noindex ? '<meta name="robots" content="noindex">' : ''}
</head>
<body>
<a class="skip" href="#inhoud">Naar inhoud</a>
<header class="site"><div class="wrap">
<a class="logo" href="/">${SITE.nameHtml}</a>
<nav class="main" aria-label="Hoofdmenu">${NAV.map(([h, t]) => `<a href="${h}"${h === p.path ? ' aria-current="page"' : ''}>${esc(t)}</a>`).join('')}</nav>
</div></header>
<main id="inhoud"><div class="wrap">
${crumbs}
${p.body}
</div></main>
<footer class="site"><div class="wrap">
<nav aria-label="Voettekst"><a href="mailto:${SITE.email}">Contact</a><a href="/over/">Over &amp; verdienmodel</a><a href="/bronnen/">Bronnen &amp; cijfers</a><a href="/disclaimer/">Disclaimer</a><a href="/privacy/">Privacy (geen cookies)</a></nav>
<p>© 2026 ${SITE.name}. Boekhouding, geld en belasting voor zzp'ers, met bronvermelding. Geen tracking, geen cookies. Uitkomsten zijn indicaties, geen financieel of fiscaal advies. Cijfers en prijzen gecontroleerd op ${fmtDate(SITE.updated)}.</p>
</div></footer>
${(p.scripts || []).map((s) => `<script type="module" src="${s}"></script>`).join('\n')}
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
export function webApp({ name, url, description }) {
  return {
    '@context': 'https://schema.org', '@type': 'WebApplication', name, url, description,
    applicationCategory: 'FinanceApplication', operatingSystem: 'Any', inLanguage: 'nl-NL',
    isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  };
}
export function faqSchema(items) {
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })) };
}
export function faqHtml(items) {
  return items.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${a}</p></details>`).join('\n');
}
