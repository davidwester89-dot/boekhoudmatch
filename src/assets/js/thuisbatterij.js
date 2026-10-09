import { bindForm, writeForm, setText, rows } from './form.js';
import { decodeHourly, batterijAnalyse, kalibreerProfiel } from './lib/battery.js';
import { euro, kwh, pct, getal } from './lib/format.js';

const form = document.getElementById('form');
const PRESETS = {
  stekker: { capaciteit: 2.688, vermogen: 0.8, investering: 1195, note: 'Voorbeeld: HomeWizard Plug-In Battery, 2,7 kWh, 800 W, € 1.195 (webshopprijs oktober 2026).' },
  b5: { capaciteit: 5, vermogen: 2.5, investering: 4000, note: 'Voorbeeldprijs, geen marktgemiddelde: vul de prijs uit je eigen offerte in (incl. installatie).' },
  b10: { capaciteit: 10, vermogen: 5, investering: 6500, note: 'Voorbeeldprijs, geen marktgemiddelde: vul de prijs uit je eigen offerte in (incl. installatie).' },
};
form.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => {
  const p = PRESETS[b.dataset.preset];
  writeForm(form, p); setText('preset-note', p.note);
  form.dispatchEvent(new Event('change'));
}));

let data = null;
let calKey = '', cal = null;
const res = await fetch('/data/hourly-2025.json');
data = decodeHourly(await res.json());

function chart(cum, inv) {
  const svg = document.getElementById('chart');
  const W = 400, H = 160, pad = 28;
  const max = Math.max(inv, ...cum, 1);
  const x = (i) => pad + (i / Math.max(1, cum.length)) * (W - pad - 8);
  const y = (v) => H - pad + 6 - (v / max) * (H - pad - 10);
  const pts = [[0, 0], ...cum.map((v, i) => [i + 1, v])].map(([i, v]) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  svg.innerHTML = `<line x1="${pad}" y1="${y(0)}" x2="${W - 8}" y2="${y(0)}" stroke="#c9d1d7"/>
<line x1="${pad}" y1="${y(inv)}" x2="${W - 8}" y2="${y(inv)}" stroke="#a12b2b" stroke-dasharray="5 4"/>
<polyline points="${pts}" fill="none" stroke="#1d7a3e" stroke-width="3"/>
<text x="${pad}" y="${H - 6}" font-size="11" fill="#5b6670">jaar 0</text><text x="${W - 50}" y="${H - 6}" font-size="11" fill="#5b6670">jaar ${cum.length}</text>
<text x="${pad + 4}" y="${y(inv) - 4}" font-size="11" fill="#a12b2b">${euro(inv)}</text>`;
}

bindForm(form, (v) => {
  document.getElementById('vast-velden').hidden = v.type === 'dynamisch';
  document.getElementById('dyn-velden').hidden = v.type !== 'dynamisch';
  const verbruik = Math.max(0, v.verbruik || 0), opwek = Math.max(0, v.opwek || 0);
  const doel = Number.isFinite(v.zelfverbruik) ? v.zelfverbruik / 100 : 0;
  const key = `${verbruik}|${opwek}|${doel}`;
  if (key !== calKey) { cal = kalibreerProfiel(data, verbruik, opwek, doel); calKey = key; }
  const contract = v.type === 'dynamisch'
    ? { type: 'dynamisch', inkoopOpslag: v.opslag, terugleverkosten: v.dynKosten, terugleveringInclBtw: v.terugBtw }
    : { type: 'vast', allIn: v.allIn, vergoeding: v.vergoeding, terugleverkosten: v.terugleverkosten };
  const a = batterijAnalyse(data, {
    verbruik, opwek, capaciteit: v.capaciteit, vermogen: v.vermogen, rendement: (v.rendement || 90) / 100,
    contract, investering: v.investering, levensduur: Math.round(v.levensduur || 12), degradatie: (v.degradatie || 0) / 100,
    loadProfiel: cal.profiel,
  });
  setText('out-besparing', euro(a.besparing) + ' per jaar');
  setText('out-tvt', a.terugverdienJaar
    ? `Terugverdiend na ongeveer ${getal(a.terugverdienJaar, 1)} jaar.`
    : `Niet terugverdiend binnen ${Math.round(v.levensduur || 12)} jaar met deze aannames (totale besparing ${euro(a.cumulatief.at(-1) || 0)}).`);
  const al = document.getElementById('out-alert');
  const msgs = [];
  if (opwek <= 0) msgs.push('Zonder zonnepanelen laadt een batterij met zelfverbruik-sturing niet op. Alleen met handelen op prijzen (niet meegerekend) kan dan iets worden bespaard.');
  if (doel > 0 && Math.abs(cal.bereikt - doel) > 0.01) msgs.push(`Het ingevulde eigen verbruik (${pct(doel)}) valt buiten wat met dit profiel kan; we rekenen met ${pct(cal.bereikt)}.`);
  al.innerHTML = msgs.map((m) => `<div class="alert">${m}</div>`).join('');
  rows(document.getElementById('out-table'), [
    ['Stroomkosten zonder batterij', euro(a.zonder.kosten)],
    ['Stroomkosten met batterij', euro(a.met.kosten)],
    ['Afname van het net', `${kwh(a.zonder.afname)} → ${kwh(a.met.afname)}`],
    ['Teruglevering', `${kwh(a.zonder.teruglevering)} → ${kwh(a.met.teruglevering)}`],
    ['Uit de batterij gebruikt', kwh(a.met.uitBatterij)],
    ['Eigen gebruik zonnestroom', `${pct(a.zonder.zelfconsumptie)} → ${pct(a.met.zelfconsumptie)}`],
    ['Volle laadcycli per jaar', getal(a.met.cycli)],
    ['Besparing per kWh uit batterij', a.met.uitBatterij > 0 ? `${getal((a.besparing / a.met.uitBatterij) * 100, 1)} ct` : '–'],
  ]);
  chart(a.cumulatief, v.investering || 0);
});
