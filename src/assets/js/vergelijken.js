// Filters op de vergelijkingspagina. Leest alleen data-attributen; verandert nooit de volgorde (alfabet).
// ?aanbieders=a,b,c (vanuit de match): toon alleen die aanbieders, nog steeds op alfabet. URL met parameters = noindex.
import { noindexMetParams } from './form.js';
noindexMetParams();
const form = document.getElementById('filters');
const euro = (x) => '€ ' + x.toFixed(2).replace('.', ',');
const rows = [...document.querySelectorAll('table.compare tbody tr')];
const cards = [...document.querySelectorAll('.vcard')];
const orig = new Map(cards.map((c) => [c, c.querySelector('[data-vanaf]').textContent]));
const ids = new Set((new URLSearchParams(location.search).get('aanbieders') || '').split(',').filter((id) => cards.some((c) => c.dataset.v === id)));
if (ids.size) {
  const box = document.getElementById('f-sel');
  const namen = cards.filter((c) => ids.has(c.dataset.v)).map((c) => c.querySelector('h3')?.textContent.trim() || c.dataset.v);
  box.textContent = `Je vergelijkt ${ids.size} aanbieders uit je match: ${namen.join(', ')} (op alfabet). `;
  const all = document.createElement('a'); all.href = location.pathname; all.textContent = 'Toon alle aanbieders'; box.append(all);
  box.hidden = false;
}
const inSel = (v) => !ids.size || ids.has(v);
const prijs = (tr, f) => Number(f.bank ? tr.dataset.prijsbank : tr.dataset.prijs);
function past(tr, f) {
  const d = tr.dataset;
  if (d.boekhouding !== '1') return false;
  if (f.rv) { const r = d.rv.split(' '); if (!(r.includes(f.rv) || (f.rv === 'eenmanszaak' && d.rv === 'onbekend'))) return false; }
  if (f.budget && prijs(tr, f) > Number(f.budget) + 1e-9) return false;
  for (const k of ['bank', 'btw', 'uren', 'ib', 'proef']) if (f[k] && d[k] !== '1') return false;
  return true;
}
function run() {
  const f = { rv: form.rv.value, budget: form.budget.value };
  for (const k of ['bank', 'btw', 'uren', 'ib', 'proef']) f[k] = form[k].checked;
  const actief = f.rv || f.budget || ['bank', 'btw', 'uren', 'ib', 'proef'].some((k) => f[k]);
  const best = new Map();
  let nPak = 0;
  for (const tr of rows) {
    const ok = inSel(tr.dataset.v) && (!actief || past(tr, f));
    tr.hidden = !ok;
    if (ok) { nPak++; const v = tr.dataset.v, p = prijs(tr, f); if (tr.dataset.boekhouding === '1' && (!best.has(v) || p < best.get(v))) best.set(v, p); }
  }
  let nA = 0;
  for (const c of cards) {
    const ok = inSel(c.dataset.v) && (!actief || best.has(c.dataset.v));
    c.hidden = !ok; if (ok) nA++;
    c.querySelector('[data-vanaf]').textContent = actief && best.has(c.dataset.v) ? euro(best.get(c.dataset.v)) : orig.get(c);
  }
  document.getElementById('f-count').textContent = ids.size && !actief ? `${nA} aanbieders uit je match, ${nPak} pakketten.` : actief ? `${nA} aanbieders, ${nPak} pakketten voldoen aan je filters.` : `${cards.length} aanbieders, ${rows.length} pakketten.`;
  document.getElementById('f-none').hidden = nA > 0;
}
form.addEventListener('change', run);
form.addEventListener('submit', (e) => e.preventDefault());
run();
