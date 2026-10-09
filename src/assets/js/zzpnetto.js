import { bindForm, setText, rows } from './form.js';
import { zzpNetto } from './lib/zzp.js';
import { euro, pct } from './lib/format.js';

bindForm(document.getElementById('form'), (v) => {
  const winst = (v.omzet || 0) - (v.kosten || 0);
  const r = zzpNetto({ winst, urencriterium: v.uren, starter: v.starter, inkomensvoorzieningen: v.voorz });
  setText('out-netto', euro(r.nettoPerMaand));
  const omzet = v.omzet || 0;
  setText('out-reserve', winst > 0
    ? `Je betaalt ${euro(r.totaalBelasting)} aan inkomstenbelasting en Zvw: ${pct(r.effectiefTarief)} van je winst${omzet > 0 ? `, ofwel ${pct(r.totaalBelasting / omzet)} van je omzet excl. btw. Reserveer dat deel van elke betaalde factuur.` : '.'}`
    : 'Bij verlies of nul winst betaal je geen inkomstenbelasting of Zvw over je onderneming.');
  const list = [
    ['Winst', euro(r.winst)],
    ['Zelfstandigenaftrek', '− ' + euro(r.zelfstandigenaftrek)],
  ];
  if (r.startersaftrek) list.push(['Startersaftrek', '− ' + euro(r.startersaftrek)]);
  list.push(['Mkb-winstvrijstelling (12,7%)', '− ' + euro(r.mkbVrijstelling)], ['Belastbare winst', euro(r.belastbareWinst)]);
  if (r.inkomensvoorzieningen) list.push(['AOV / lijfrente', '− ' + euro(r.inkomensvoorzieningen)]);
  list.push(
    ['Inkomstenbelasting vóór kortingen', euro(r.brutoBelasting)],
  );
  if (r.tariefAanpassing) list.push(['Tariefaanpassing aftrekposten', '+ ' + euro(r.tariefAanpassing)]);
  list.push(
    ['Algemene heffingskorting', '− ' + euro(r.algemeneHeffingskorting)],
    ['Arbeidskorting', '− ' + euro(r.arbeidskorting)],
    ['Te betalen inkomstenbelasting', euro(r.inkomstenbelasting)],
    ['Zvw-bijdrage (4,85%)', euro(r.zvw)],
    ['Netto per jaar' + (r.inkomensvoorzieningen ? ' (na AOV/lijfrente)' : ''), euro(r.nettoNaVoorzieningen), 'total'],
  );
  rows(document.getElementById('out-table'), list);
});
