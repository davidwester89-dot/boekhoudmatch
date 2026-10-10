import { SITE, esc, fmtDate, ORG } from '../layout.mjs';

const TOOLNAMES = {
  '/boekhoudprogramma-kiezen/': 'Welk boekhoudprogramma past bij jou? Doe de match',
  '/boekhoudprogramma-vergelijken/': 'Boekhoudprogramma\'s vergelijken',
  '/zzp-netto-inkomen/': 'Bereken je netto inkomen als zzp\'er',
  '/zzp-uurtarief/': 'Bereken je uurtarief',
  '/btw-berekenen/': 'Btw berekenen',
  '/offerte-factuur-maken/': 'Gratis offerte en factuur maken',
};
export { TOOLNAMES };

const AUTHOR = { '@type': 'Person', name: 'Dave West', url: SITE.domain + '/over/' };
const readMin = (w) => Math.max(1, Math.round(w / 200));
// Blogafbeelding: vaste maten 1200×630 (ook og:image) en 600×315.
export const POST_IMG = { w: 1200, h: 630, small: 600 };
export const postImg = (name, w = POST_IMG.w) => `/img/blog/${name}-${w}.webp`;
const figure = (img) => `<figure class="post-img"><img src="${postImg(img.name)}" srcset="${postImg(img.name, POST_IMG.small)} ${POST_IMG.small}w, ${postImg(img.name)} ${POST_IMG.w}w" sizes="(min-width: 760px) 720px, calc(100vw - 40px)" width="${POST_IMG.w}" height="${POST_IMG.h}" alt="${esc(img.alt)}" decoding="async">${img.caption ? `<figcaption class="note">${esc(img.caption)}</figcaption>` : ''}</figure>`;

export function postPage(post, all, ogKey) {
  const others = all.filter((x) => x.slug !== post.slug).slice(0, 2);
  const body = `
<article class="article">
<h1>${esc(post.title)}</h1>
<p class="post-meta">Door <a href="/over/">Dave West</a> · <time datetime="${post.date}">${fmtDate(post.date)}</time>${post.updated !== post.date ? ` · bijgewerkt <time datetime="${post.updated}">${fmtDate(post.updated)}</time>` : ''}${post.checked ? ` · bronnen gecontroleerd op <time datetime="${post.checked}">${fmtDate(post.checked)}</time>` : ''} · ${readMin(post.words)} min lezen</p>
${post.image ? figure(post.image) : ''}
${post.html}
${post.tools.length ? `<aside class="cta"><h2>Reken het zelf uit</h2><ul>${post.tools.map((t) => `<li><a href="${t}">${esc(TOOLNAMES[t] || t)} →</a></li>`).join('')}</ul></aside>` : ''}
<h2>Bronnen</h2>
<ul class="sources">${post.sources.map((s) => `<li><a href="${esc(s.url)}" rel="noopener">${esc(s.title)}</a></li>`).join('')}</ul>
<p class="note">Dit artikel is algemene informatie, geen persoonlijk advies. Zie onze <a href="/disclaimer/">disclaimer</a>. Fout gezien? Mail naar <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
</article>
${others.length ? `<h2>Meer op de blog</h2><div class="grid cards two">${others.map((x) => `<a class="card" href="${x.path}"><time datetime="${x.date}" class="note">${fmtDate(x.date)}</time><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p></a>`).join('')}</div>` : ''}`;
  return {
    path: post.path, title: post.seoTitle, ogTitle: post.title, description: post.description, crumb: post.title,
    parents: [['/blog/', 'Blog']], navPath: '/blog/', og: ogKey, ogType: 'article',
    ogAlt: post.image ? post.image.alt : null, updated: post.updated,
    article: { date: post.date, updated: post.updated },
    body,
    schema: [{
      '@context': 'https://schema.org', '@type': 'Article', headline: post.title, description: post.description,
      datePublished: post.date, dateModified: post.updated, inLanguage: 'nl-NL', wordCount: post.words,
      author: AUTHOR, publisher: ORG,
      image: post.image ? [{ '@type': 'ImageObject', url: SITE.domain + postImg(post.image.name), width: POST_IMG.w, height: POST_IMG.h, caption: post.image.alt }, `${SITE.domain}/og/${ogKey}.png`] : `${SITE.domain}/og/${ogKey}.png`,
      mainEntityOfPage: { '@type': 'WebPage', '@id': SITE.domain + post.path },
      citation: post.sources.map((s) => s.url),
    }],
  };
}

export function blogIndex(posts) {
  const body = `
<h1>Blog: boekhouding en belasting voor zzp'ers</h1>
<p class="lead">Wat verandert er, en wat betekent het voor jou? Kort uitgelegd, met de officiële bronnen erbij.</p>
<div class="postlist">
${posts.map((x) => `<a class="card" href="${x.path}"><time datetime="${x.date}">${fmtDate(x.date)}</time><h2 style="margin:.2em 0 .3em;font-size:1.3rem">${esc(x.title)}</h2><p>${esc(x.description)}</p><span class="more">Lees verder →</span></a>`).join('\n')}
</div>
<p class="note" style="margin-top:22px">Volg nieuwe artikelen via <a href="/blog/feed.xml">RSS</a>.</p>`;
  return {
    path: '/blog/', title: 'Blog voor zzp\'ers: boekhouding en belasting | BoekhoudMatch', ogTitle: 'Blog: boekhouding en belasting voor zzp\'ers',
    description: 'Actuele artikelen over boekhouding, btw en belasting voor zzp\'ers: wat verandert er en wat betekent het voor jou? Met officiële bronnen.',
    crumb: 'Blog', og: 'blog', body, updated: posts[0]?.updated,
    schema: [{ '@context': 'https://schema.org', '@type': 'Blog', name: 'BoekhoudMatch blog', url: SITE.domain + '/blog/', inLanguage: 'nl-NL', publisher: ORG,
      blogPost: posts.map((x) => ({ '@type': 'BlogPosting', headline: x.title, url: SITE.domain + x.path, datePublished: x.date, dateModified: x.updated })) }],
  };
}

export function latestHtml(posts, n = 3) {
  if (!posts.length) return '';
  return `<h2>Nieuw op de blog</h2><div class="grid cards">${posts.slice(0, n).map((x) => `<a class="card" href="${x.path}"><time datetime="${x.date}" class="note">${fmtDate(x.date)}</time><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p><span class="more">Lees verder →</span></a>`).join('')}</div>`;
}

const rfc822 = (iso) => new Date(iso + 'T08:00:00+02:00').toUTCString();
export function feed(posts) {
  const x = (s) => esc(s);
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>BoekhoudMatch blog</title>
<link>${SITE.domain}/blog/</link>
<description>Boekhouding, btw en belasting voor zzp'ers, met bronnen.</description>
<language>nl-nl</language>
<atom:link href="${SITE.domain}/blog/feed.xml" rel="self" type="application/rss+xml"/>
${posts[0] ? `<lastBuildDate>${rfc822(posts[0].updated)}</lastBuildDate>` : ''}
${posts.map((p) => `<item><title>${x(p.title)}</title><link>${SITE.domain}${p.path}</link><guid isPermaLink="true">${SITE.domain}${p.path}</guid><pubDate>${rfc822(p.date)}</pubDate><description>${x(p.description)}</description></item>`).join('\n')}
</channel>
</rss>
`;
}
