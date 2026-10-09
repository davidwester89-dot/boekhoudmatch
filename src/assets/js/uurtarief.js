import { bindForm, setText, rows } from './form.js';
import { uurtarief, uurtariefVanuitSalaris } from './lib/zzp.js';
import { euro, euro2, getal } from './lib/format.js';

bindForm(document.getElementById('form'), (v) => {
  const sal = v.modus === 'salaris';
  document.getElementById('m-netto').hidden = sal;
  document.getElementById('m-salaris').hidden = !sal;
  const common = {
    kostenJaar: v.kosten || 0, aovMaand: v.aov || 0, pensioenMaand: v.pensioen || 0,
    werkweken: v.weken || 0, urenPerWeek: v.uren || 0, declarabelPct: (v.declarabel || 0) / 100, starter: v.starter,
  };
  const r = sal
    ? uurtariefVanuitSalaris({ ...common, brutoMaand: v.brutoMaand || 0, vakantiegeldPct: (v.vakantiegeld || 0) / 100, dertiendeMaand: v.dertiende, pensioenWerknemerPct: (v.pensioenWn || 0) / 100 })
    : uurtarief({ ...common, doelNettoMaand: v.doelNetto || 0 });
  setText('out-tarief', Number.isFinite(r.uurtariefExBtw) ? euro2(r.uurtariefExBtw) + ' per uur' : '–');
  setText('out-sub', Number.isFinite(r.uurtariefExBtw) ? `Inclusief 21% btw: ${euro2(r.uurtariefInclBtw)} per uur. Over ${getal(r.declarabeleUren)} declarabele uren per jaar.` : 'Vul je uren in.');
  const al = document.getElementById('out-alert');
  al.innerHTML = r.urencriterium ? '' : `<div class="alert">Met ${getal(r.totaalUren)} uur per jaar haal je het urencriterium (1.225 uur) niet: geen zelfstandigenaftrek. Daar is in dit tarief rekening mee gehouden.</div>`;
  const list = [];
  if (sal) list.push(['Bruto jaarloon (incl. vakantiegeld)', euro(r.loondienst.brutoJaar)], ['Netto jaarloon in loondienst', euro(r.loondienst.netto)]);
  list.push(
    ['Gewenst netto per jaar', euro(r.detail.nettoNaVoorzieningen)],
    ['AOV + pensioen per jaar', euro(r.detail.inkomensvoorzieningen)],
    ['Inkomstenbelasting + Zvw', euro(r.detail.totaalBelasting)],
    ['Benodigde winst', euro(r.benodigdeWinst)],
    ['Zakelijke kosten', euro(v.kosten || 0)],
    ['Benodigde omzet (excl. btw)', euro(r.benodigdeOmzet), 'total'],
  );
  rows(document.getElementById('out-table'), list);
});
