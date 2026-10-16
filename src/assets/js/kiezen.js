import { bindForm, setUrl } from './form.js';
import { bewaar, laad, wis } from './lib/opslag.js';

// Vorige antwoorden terugzetten (alleen op dit apparaat bewaard). Een link met antwoorden gaat altijd voor.
const OPSLAG = 'boekhoudmatch-quiz-v1';
const store = (() => { try { return window.localStorage; } catch { return null; } })();
const VELDEN = [...new Set([...document.querySelectorAll('#form [name]')].map((x) => x.name))];
let hersteld = false;
if (store && !location.search) { const q = laad(store, OPSLAG, VELDEN); if (q) { setUrl(`${location.pathname}?${q}${location.hash}`); hersteld = true; } }

// Oude links met budget=Infinity: omzetten naar budget=geen (zelfde betekenis, nette URL).
if (/[?&]budget=Infinity\b/.test(location.search)) setUrl(location.pathname + location.search.replace(/budget=Infinity\b/, 'budget=geen') + location.hash);
import { PAKKETTEN } from './lib/pakketten.js';
import { match } from './lib/match.js';
import { track } from './consent.js';
import { REDACTIE, vendorHref } from './lib/aanbieders.js';
import { uitgaand, ctaTekst } from './lib/partnerlinks.js';

const euro = (x) => '€ ' + x.toFixed(2).replace('.', ',');
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const byId = Object.fromEntries(PAKKETTEN.map((p) => [p.id, p]));

const host = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '');

// Uitgaande knop naar de aanbieder (nieuw tabblad). Partnerlink alleen als die in partnerlinks.js staat; dan met label.
function knop(a, r, pos, cls) {
  const red = REDACTIE[a.id], u = uitgaand(a), c = ctaTekst(red.kort, { proef: red.proef, prijs: r.prijs });
  const l = el('a', cls);
  l.href = u.href; l.target = '_blank'; l.rel = u.rel;
  l.dataset.vendor = a.naam; l.dataset.pos = String(pos); l.dataset.cta = c.gratis ? 'trial' : 'visit';
  l.append(document.createTextNode(pos === 1 ? c.tekst : `Bekijk ${red.kort}`), el('span', '', ' ↗'), el('span', 'sr-only', ' (opent in een nieuw tabblad)'));
  l.lastChild.previousSibling.setAttribute('aria-hidden', 'true');
  return { l, u, c, red };
}
function paginaLink(a, pos, tekst) {
  const l = el('a', 'vlink', tekst); l.href = vendorHref(a.id);
  l.dataset.vendor = a.naam; l.dataset.pos = String(pos); l.dataset.cta = 'vendor_page';
  return l;
}
const plabel = () => el('span', 'plabel', 'partnerlink');

function lijst(cls, items) { const ul = el('ul', cls); for (const t of items) ul.append(el('li', '', t)); return ul; }

let topVendor = '';
// Antwoorden in de binnenkomende link? (bindForm zet daarna altijd de antwoorden in de URL.)
const inLink = new URLSearchParams(location.search);
const form = document.getElementById('form');
bindForm(form, (v) => {
  const extra = [v.offertes && 'offertes', v.uren && 'uren'].filter(Boolean);
  const res = match(PAKKETTEN, { ...v, extra });
  const top = document.getElementById('out-top');
  const passend = res.filter((r) => r.past);
  top.replaceChildren(...(passend.length ? passend.slice(0, 3) : []).map((r) => {
    const li = el('li');
    li.append(el('strong', '', `${r.naam} ${r.planNaam}`), el('span', 'price', ` ${euro(r.prijs)} p/m${r.binnenBudget ? '' : ' (boven budget)'}`));
    const pos = passend.indexOf(r) + 1;
    if (pos > 1) {
      const a = byId[r.aanbieder], { l, u, red } = knop(a, r, pos, 'btn ghost sm');
      const d = el('div', 'mini-cta'); d.append(l, paginaLink(a, pos, `Alles over ${red.kort}`));
      if (u.partner) d.append(plabel());
      li.append(d);
    }
    return li;
  }));

  // Hoofdknop voor de nummer 1 (volgorde komt uit de match; partnerlinks tellen niet mee).
  const cta = document.getElementById('out-cta');
  if (passend[0]) {
    const r = passend[0], a = byId[r.aanbieder], { l, u, c, red } = knop(a, r, 1, 'btn');
    cta.replaceChildren(...[l, u.partner && plabel(), paginaLink(a, 1, `Lees alles over ${red.kort} →`)].filter(Boolean));
    cta.hidden = false;
  } else { cta.replaceChildren(); cta.hidden = true; }

  // Vergelijk de top 3 naast elkaar (de vergelijking toont ze op alfabet).
  const cmp = document.getElementById('out-cmp');
  const top3 = passend.slice(0, 3).map((r) => r.aanbieder);
  cmp.href = '/boekhoudprogramma-vergelijken/' + (top3.length ? `?aanbieders=${top3.join(',')}` : '') + '#per-aanbieder';
  cmp.textContent = top3.length > 1 ? `Vergelijk deze ${top3.length} naast elkaar` : 'Vergelijk alle aanbieders';
  if (!passend.length) top.replaceChildren(el('li', '', 'Geen pakket past bij al je wensen. Hieronder zie je waarom, en wat het dichtst in de buurt komt.'));
  topVendor = passend[0] ? passend[0].naam : '';
  document.getElementById('big-mirror').textContent = passend[0] ? `${passend[0].naam} ${passend[0].planNaam}` : '–';

  // Vooringestelde aanbieder (?aanbieder=id, vanaf een aanbiederpagina): laat zien waar die staat. Verandert de volgorde niet.
  const pick = document.getElementById('out-pick');
  const pi = v.aanbieder ? res.findIndex((r) => r.aanbieder === v.aanbieder) : -1;
  if (pi >= 0) {
    const r = res[pi];
    pick.hidden = false;
    pick.replaceChildren(el('p', 'lbl', `Jouw keuze: ${r.naam}`), el('p', '', r.past ? `Plek ${pi + 1} van ${res.length}: ${r.planNaam}, ${euro(r.prijs)} p/m${r.binnenBudget ? '' : ' (boven budget)'}.` : `Past niet bij je antwoorden: ${r.nee[0] || ''}`));
  } else pick.hidden = true;

  const list = document.getElementById('out-list');
  list.replaceChildren(...res.map((r, i) => {
    const a = byId[r.aanbieder];
    const card = el('article', 'card rank ' + (r.past ? (r.binnenBudget ? 'fit' : 'over') : 'nofit') + (r.aanbieder === v.aanbieder ? ' picked' : ''));
    const h = el('h3');
    h.append(el('span', 'pos', r.past ? `${i + 1}.` : '–'), document.createTextNode(` ${r.naam} `), el('span', 'plan', r.planNaam));
    card.append(h);
    const p = el('p', 'price');
    p.textContent = `${euro(r.prijs)} per maand${r.prijsJaar !== null ? ` · ${euro(r.prijsJaar)} p/m bij jaarbetaling` : ''}${a.btwPrijzen === 'excl' ? ' · excl. btw' : ' · btw niet vermeld'}`;
    card.append(p);
    if (r.nee.length) { card.append(el('p', 'lbl bad', 'Past niet omdat:'), lijst('nee', r.nee)); }
    if (r.plus.length) { card.append(el('p', 'lbl ok', 'Waarom het past:'), lijst('plus', r.plus)); }
    if (r.let_op.length) { card.append(el('p', 'lbl warn', 'Let op:'), lijst('letop', r.let_op)); }
    if (r.alternatieven?.length) card.append(el('p', 'sub', 'Ook passend bij deze aanbieder: ' + r.alternatieven.join(', ') + '.'));
    if (a.actie) card.append(el('p', 'sub', 'Actie: ' + a.actie));
    const more = el('p', 'vmore'); const ml = paginaLink(a, r.past ? i + 1 : 0, `Alles over ${REDACTIE[a.id].kort} →`); more.append(ml); card.append(more);
    return card;
  }));
});

// Antwoorden bewaren na elke eigen keuze; 'Opnieuw beginnen' wist ze.
const resume = document.getElementById('q-resume');
if (resume && hersteld) resume.hidden = false;
const opslaan = (e) => { if (store && (!e || e.isTrusted || e.type === 'submit')) bewaar(store, OPSLAG, location.search, VELDEN); };
form.addEventListener('change', opslaan);
form.addEventListener('submit', opslaan);
document.addEventListener('click', (e) => {
  const r = e.target.closest('[data-reset]'); if (!r) return;
  e.preventDefault(); if (store) wis(store, OPSLAG);
  location.href = location.pathname;
});

// Statistieken (alleen na toestemming, zie consent.js): start = eerste eigen antwoord,
// afgerond = vraag 8 beantwoord of de uitslag geopend. Alleen de naam van de beste match, nooit de antwoorden.
let started = false, done = false;
form.addEventListener('change', (e) => {
  if (!e.isTrusted) return;
  if (!started) { started = true; track('quiz_start', {}); }
  if (e.target.name === 'budget') complete();
});
document.addEventListener('click', (e) => { if (started && e.target.closest('a[href="#rangorde"], a[href="#uitkomst"]')) complete(); });
function complete() {
  if (done || !started) return;
  done = track('quiz_complete', { vendor: topVendor || 'geen' });
}

// Link naar de uitslag kopiëren: de invoer staat al in de URL (URL's met invoer zijn noindex).
const copyBtn = document.getElementById('out-copy'), copyOk = document.getElementById('out-copy-ok');
if (copyBtn) {
  const delen = typeof navigator.share === 'function' && matchMedia('(pointer: coarse)').matches;
  if (!navigator.clipboard && !delen) copyBtn.hidden = true;
  if (delen) copyBtn.textContent = 'Deel of bewaar je uitslag';
  copyBtn.addEventListener('click', async () => {
    opslaan();
    if (delen) { try { await navigator.share({ title: 'Mijn BoekhoudMatch-uitslag', url: location.href }); return; } catch (err) { if (err && err.name === 'AbortError') return; } }
    try { await navigator.clipboard.writeText(location.href); copyOk.textContent = 'Link gekopieerd. Bewaar of deel hem; je antwoorden staan erin.'; }
    catch { copyOk.textContent = 'Kopiëren lukte niet; kopieer de adresbalk.'; }
  });
}
// Overige CTA's in de uitslag (zonder aanbieder): alleen het soort klik, na toestemming.
document.getElementById('uitkomst').addEventListener('click', (e) => {
  const t = e.target.closest('[data-cta]');
  if (t && !t.dataset.vendor) track('match_cta', { cta_type: t.dataset.cta });
});

// Voortgang: welke vragen heeft de bezoeker zelf beantwoord (of bevestigd door erop te tikken)?
// Komt de bezoeker binnen met antwoorden in de link, dan tellen alle vragen als beantwoord.
const vragen = [...form.querySelectorAll('fieldset.q')];
const gedaan = new Set();
// Antwoorden uit de link (bijv. ?rechtsvorm=bv vanaf de homepage) tellen alleen voor die vragen.
vragen.forEach((f, i) => { if ([...f.querySelectorAll('input')].some((x) => inLink.has(x.name) && (x.type !== 'checkbox' || inLink.get(x.name) === '1' || inLink.has('budget')))) gedaan.add(i); });
function voortgang() {
  const n = gedaan.size, N = vragen.length;
  document.getElementById('q-prog').textContent = n === N ? `Alle ${N} vragen beantwoord` : `${n} van ${N} vragen beantwoord`;
  const vl = document.getElementById('q-voorlopig'); if (vl) vl.hidden = n === N;
  if (vl && n > 0) vl.textContent = 'Nog niet alles ingevuld. Voor open vragen rekent de uitslag met gangbare antwoorden.';
  const pct = Math.round((n / N) * 100);
  document.getElementById('q-bar').style.width = `${pct}%`;
  const pb = document.querySelector('.qbar'); if (pb) { pb.setAttribute('aria-valuenow', String(n)); pb.setAttribute('aria-valuetext', `${n} van ${N} vragen beantwoord`); }
}
function markeer(e) {
  if (!e.isTrusted) return;
  const f = e.target.closest('fieldset.q'); if (!f) return;
  const i = vragen.indexOf(f); gedaan.add(i);
  if (i > 5) gedaan.add(5); // vraag 6 (extra's) is optioneel: telt mee zodra je verder bent
  voortgang();
}
form.addEventListener('change', markeer);
form.addEventListener('click', (e) => { if (e.target.matches('input')) markeer(e); });
voortgang();
form.addEventListener('submit', () => {
  vragen.forEach((f, i) => gedaan.add(i)); voortgang(); // bevestigd: de overige standaardantwoorden kloppen
  if (!started) { started = true; track('quiz_start', {}); }
  complete();
  const kop = document.getElementById('uitkomst-kop');
  document.getElementById('uitkomst').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  kop.focus({ preventScroll: true });
});
