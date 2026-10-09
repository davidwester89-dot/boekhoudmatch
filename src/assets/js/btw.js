import { bindForm, rows } from './form.js';
import { btwVanExcl, btwVanIncl } from './lib/btw.js';
import { euro2 } from './lib/format.js';
bindForm(document.getElementById('form'), (v) => {
  const t = Number(v.tarief);
  const r = v.richting === 'incl' ? btwVanIncl(v.bedrag || 0, t) : btwVanExcl(v.bedrag || 0, t);
  rows(document.getElementById('out-table'), [
    ['Exclusief btw', euro2(r.excl)], [`Btw ${Math.round(t * 100)}%`, euro2(r.btw)], ['Inclusief btw', euro2(r.incl), 'total'],
  ]);
});
