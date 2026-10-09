import { bindForm, writeForm, setText, rows } from './form.js';
import { vergelijkSalderen, kaalUitAllIn, besparingMeerEigenVerbruik } from './lib/saldering.js';
import { euro, euro2, cent, kwh, parseNum } from './lib/format.js';

const form = document.getElementById('form');
const PRESETS = {
  minimum: { note: 'Wettelijk minimum: vergoeding precies 50% van jouw kale leveringsprijs, zonder terugleverkosten. Een ondergrens voor de bruto vergoeding, geen gangbaar aanbod.' },
  vast: { vergoeding2027: 0.084, tlk2027: 0.0489, note: 'Voorbeeld: aangekondigd tarief voor een nieuw 1-jarig vast contract (bruto 8,40 ct, kosten 4,89 ct), op basis van het aangekondigde Vattenfall-tarief voor een nieuw 1-jarig vast contract (overzicht zonnesaldo.nl, geraadpleegd 8 oktober 2026). Controleer altijd je eigen aanbod.' },
  slecht: { vergoeding2027: 0.0782, tlk2027: 0.0757, note: 'Voorbeeld van een aanbod met netto maar 0,25 ct per kWh (bruto 7,82 ct, kosten 7,57 ct), op basis van het aangekondigde Greenchoice-tarief voor een nieuw 1-jarig vast contract (overzicht zonnesaldo.nl, geraadpleegd 8 oktober 2026).' },
};

form.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => {
  const p = PRESETS[b.dataset.preset];
  if (b.dataset.preset === 'minimum') {
    const allIn = parseNum(form.allIn.value);
    const kaal = kaalUitAllIn(allIn, 2026);
    writeForm(form, { vergoeding2027: Math.round(kaal * 0.5 * 10000) / 10000, tlk2027: 0 });
  } else writeForm(form, p);
  setText('preset-note', p.note);
  form.dispatchEvent(new Event('change'));
}));

bindForm(form, (v) => {
  const kaal = kaalUitAllIn(v.allIn, 2026);
  const r = vergelijkSalderen({
    afname: v.afname, teruglevering: v.teruglevering, kaalExBtw: kaal,
    vergoeding2026: v.vergoeding2026, terugleverkosten2026Kwh: v.tlk2026, terugleverkosten2026Vast: v.tlk2026vast,
    vergoeding2027: v.vergoeding2027, terugleverkosten2027: v.tlk2027,
  });
  const big = document.getElementById('out-verschil');
  big.textContent = (r.verschil > 0 ? '+ ' : r.verschil < 0 ? '− ' : '') + euro(Math.abs(r.verschil)) + ' per jaar';
  big.className = 'big ' + (r.verschil > 0 ? 'pos' : 'neg');
  setText('out-permaand', `Dat is ongeveer ${euro(Math.abs(r.verschil) / 12)} per maand ${r.verschil >= 0 ? 'meer' : 'minder'}.`);
  const al = document.getElementById('out-alert');
  if (!(kaal > 0)) al.innerHTML = '<div class="alert">Je all-in prijs is lager dan de energiebelasting plus btw. Controleer de stroomprijs.</div>';
  else if (r.vergoedingOnderMinimum) al.innerHTML = `<div class="alert">Let op: de ingevulde vergoeding (${cent(v.vergoeding2027)}) ligt onder het wettelijk minimum van 50% van je kale prijs (${cent(r.minimumVergoeding)}). Controleer je aanbod; de ACM houdt toezicht.</div>`;
  else al.innerHTML = '';
  rows(document.getElementById('out-table'), [
    ['Kale leveringsprijs (excl. btw)', cent(kaal)],
    ['All-in prijs 2026 / 2027', `${euro2(r.prijs2026)} / ${euro2(r.prijs2027)}`],
    ['Gesaldeerd in 2026', kwh(r.gesaldeerd)],
    ['kWh-kosten 2026 (met salderen)', euro(r.kosten2026)],
    ['kWh-kosten 2027 (zonder salderen)', euro(r.kosten2027)],
    ['Netto waarde teruglevering 2027', cent(r.nettoTerugleverWaarde2027) + ' per kWh'],
    ['Verschil per jaar', euro(r.verschil), 'total'],
  ]);
  const extra = Math.round(Math.min(v.teruglevering || 0, 500));
  setText('out-eigen', `Elke kWh die je in 2027 zelf gebruikt in plaats van teruglevert, scheelt ${cent(r.waardeEigenVerbruikPerKwh)}. ${extra > 0 ? `Verschuif je ${extra} kWh (bijvoorbeeld wasmachine, vaatwasser of auto laden overdag), dan bespaar je ongeveer ${euro(besparingMeerEigenVerbruik(r, extra))} per jaar.` : ''}`);
});
