import { bindForm } from './form.js';
import { PAKKETTEN } from './lib/pakketten.js';
import { match } from './lib/match.js';
import { track } from './consent.js';

const euro = (x) => '€ ' + x.toFixed(2).replace('.', ',');
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const byId = Object.fromEntries(PAKKETTEN.map((p) => [p.id, p]));

function lijst(cls, items) { const ul = el('ul', cls); for (const t of items) ul.append(el('li', '', t)); return ul; }

let topVendor = '';
const form = document.getElementById('form');
bindForm(form, (v) => {
  const extra = [v.offertes && 'offertes', v.uren && 'uren'].filter(Boolean);
  const res = match(PAKKETTEN, { ...v, extra });
  const top = document.getElementById('out-top');
  const passend = res.filter((r) => r.past);
  top.replaceChildren(...(passend.length ? passend.slice(0, 3) : []).map((r) => {
    const li = el('li');
    li.append(el('strong', '', `${r.naam} ${r.planNaam}`), el('span', 'price', ` ${euro(r.prijs)} p/m${r.binnenBudget ? '' : ' (boven budget)'}`));
    if (r.plus[0]) li.append(el('div', 'note', r.plus.slice(0, 2).join(' ')));
    return li;
  }));
  if (!passend.length) top.replaceChildren(el('li', '', 'Geen pakket past bij al je wensen. Hieronder zie je waarom, en wat het dichtst in de buurt komt.'));
  topVendor = passend[0] ? passend[0].naam : '';
  document.getElementById('big-mirror').textContent = passend[0] ? `${passend[0].naam} ${passend[0].planNaam}` : '–';
  const vol = res[0].volumes;
  document.getElementById('out-vol').textContent = `We rekenen met ${vol.facturen} facturen, ${vol.uitgaven} bonnen en ongeveer ${vol.transacties} banktransacties per maand.`;

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
    if (r.alternatieven?.length) card.append(el('p', 'note', 'Ook passend bij deze aanbieder: ' + r.alternatieven.join(', ') + '.'));
    if (a.actie) card.append(el('p', 'note', 'Actie: ' + a.actie));
    const src = el('p', 'note'); src.append('Bron: ');
    a.bronnen.forEach((b, j) => { if (j) src.append(' · '); const l = el('a', '', b.titel); l.href = b.url; l.rel = 'noopener'; l.dataset.vendor = a.naam; src.append(l); });
    card.append(src);
    return card;
  }));
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
