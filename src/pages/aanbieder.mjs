// Aanbiederpagina's: /<slug>/ per aanbieder. Alleen feiten uit pakketten.js en aanbieders.js (bron: site van de aanbieder).
import { SITE, esc, fmtDate } from '../layout.mjs';
import { PAKKETTEN } from '../lib/pakketten.js';
import { REDACTIE } from '../lib/aanbieders.js';
import { e2, checked, vanaf, bronLinks, pakketTabel, logo, softwareSchema, btwNoot, N_AANB, UNK } from '../lib/weergave.mjs';

const ul = (l) => `<ul>${l.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;

export const aanbiederPages = PAKKETTEN.map((a) => {
  const r = REDACTIE[a.id], v = vanaf(a), c = checked(a), path = `/${r.slug}/`;
  const prijzen = a.plannen.map((p) => p.prijs).filter((x) => x > 0);
  const body = `
<h1>${esc(a.naam)}: prijzen en pakketten (2026)</h1>
<p class="lead">${esc(r.kort)} heeft ${a.plannen.length} pakketten${prijzen.length ? `, van ${e2(Math.min(...prijzen))} tot ${e2(Math.max(...prijzen))} per maand` : ''} (${btwNoot(a)}). Per pakket de prijs, limieten en functies, van de site van ${esc(r.kort)} zelf.</p>
<p class="post-meta">Gecontroleerd op <time datetime="${c}">${fmtDate(c)}</time> door <a href="/over/">Dave West</a> · <a href="#bronnen">Bronnen</a></p>
<div class="actions"><a class="btn" href="/boekhoudprogramma-kiezen/?aanbieder=${a.id}" rel="nofollow">Past ${esc(r.kort)} bij jou? Doe de match</a><a class="btn ghost" href="/boekhoudprogramma-vergelijken/">Vergelijk met ${N_AANB - 1} andere aanbieders</a></div>

<h2>In het kort</h2>
<div class="vhead big">${logo(a)}</div>
<dl class="vfacts wide"><dt>Vanaf</dt><dd>${v.prijs === 0 ? 'gratis' : `${e2(v.prijs)} p/m`} (${esc(v.naam)}${v.perFactuur ? `, ${e2(v.perFactuur)} per factuur` : ''})</dd><dt>Limiet die vaak knelt</dt><dd>${esc(r.knelt)}</dd><dt>Sterk</dt><dd>${esc(r.sterk)}</dd><dt>Zwak</dt><dd>${esc(r.zwak)}</dd><dt>Gratis proberen</dt><dd>${r.proef ? `${r.proef} dagen` : UNK}</dd>${a.actie ? `<dt>Actie</dt><dd>${esc(a.actie)}</dd>` : ''}</dl>

<h2>Pakketten en prijzen</h2>
${pakketTabel(a)}
<p class="note">${esc(a.noot)}</p>

<div class="grid cards two">
<div class="card"><h2 class="h3">Voor wie wel</h2>${ul(r.wel)}</div>
<div class="card"><h2 class="h3">Voor wie niet</h2>${ul(r.niet)}</div>
</div>

<h2 id="bronnen">Bronnen</h2>
<ul class="sources">${a.bronnen.map((b) => `<li><a href="${b.url}" rel="noopener" data-vendor="${esc(a.naam)}">${esc(b.titel)}</a></li>`).join('')}</ul>
<p class="note">De informatie bij ${esc(r.kort)} is leidend. Fout gezien? Mail naar <a href="mailto:${SITE.email}">${SITE.email}</a>. Hoe we werken: <a href="/over/">over ons</a>.</p>
<p>Twijfel je tussen ${esc(r.kort)} en een ander pakket? <a href="/boekhoudprogramma-kiezen/">Doe de match</a> of bekijk de <a href="/boekhoudprogramma-vergelijken/">vergelijking</a>.</p>
{{related}}`;
  const titel = `${r.kort} prijzen 2026: pakketten en limieten | BoekhoudMatch`;
  return {
    path, title: titel.length <= 62 ? titel : `${r.kort} prijzen 2026 | BoekhoudMatch`, ogTitle: `${a.naam}: prijzen en pakketten`, og: 'vergelijken',
    description: `${r.kort}: ${a.plannen.length} pakketten, ${v.prijs === 0 ? 'ook een gratis pakket' : `vanaf ${e2(v.prijs)} p/m`}. Prijs, limieten, btw-aangifte en bankkoppeling per pakket, gecontroleerd op ${fmtDate(c)}.`,
    crumb: r.kort, parents: [['/boekhoudprogramma-vergelijken/', 'Vergelijken']], navPath: '/boekhoudprogramma-vergelijken/', updated: c,
    body, schema: [softwareSchema(a, SITE.domain + path)],
  };
});
