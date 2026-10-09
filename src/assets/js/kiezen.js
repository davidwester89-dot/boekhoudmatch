import { bindForm } from './form.js';
import { PAKKETTEN } from './lib/pakketten.js';
import { match } from './lib/match.js';

const euro = (x) => '€ ' + x.toFixed(2).replace('.', ',');
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const byId = Object.fromEntries(PAKKETTEN.map((p) => [p.id, p]));

function lijst(cls, items) { const ul = el('ul', cls); for (const t of items) ul.append(el('li', '', t)); return ul; }

bindForm(document.getElementById('form'), (v) => {
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
  document.getElementById('big-mirror').textContent = passend[0] ? `${passend[0].naam} ${passend[0].planNaam}` : '–';
  const vol = res[0].volumes;
  document.getElementById('out-vol').textContent = `We rekenen met ${vol.facturen} facturen, ${vol.uitgaven} bonnen en ongeveer ${vol.transacties} banktransacties per maand.`;

  const list = document.getElementById('out-list');
  list.replaceChildren(...res.map((r, i) => {
    const a = byId[r.aanbieder];
    const card = el('article', 'card rank ' + (r.past ? (r.binnenBudget ? 'fit' : 'over') : 'nofit'));
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
    a.bronnen.forEach((b, j) => { if (j) src.append(' · '); const l = el('a', '', b.titel); l.href = b.url; l.rel = 'noopener'; src.append(l); });
    card.append(src);
    return card;
  }));
});
