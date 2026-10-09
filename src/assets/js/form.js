import { parseNum } from './lib/format.js';

/** Lees alle velden van een formulier naar een object (getallen geparsed, checkboxen boolean). */
export function readForm(form) {
  const out = {};
  for (const el of form.elements) {
    if (!el.name) continue;
    if (el.type === 'checkbox') out[el.name] = el.checked;
    else if (el.type === 'radio') { if (el.checked) out[el.name] = el.value; }
    else if (el.dataset.num !== undefined) out[el.name] = parseNum(el.value);
    else out[el.name] = el.value;
  }
  return out;
}

export function writeForm(form, values) {
  for (const [k, v] of Object.entries(values)) {
    const els = form.querySelectorAll(`[name="${k}"]`);
    els.forEach((el) => {
      if (el.type === 'checkbox') el.checked = v === true || v === '1' || v === 'true';
      else if (el.type === 'radio') el.checked = el.value === String(v);
      else el.value = typeof v === 'number' ? String(v).replace('.', ',') : v;
    });
  }
}

/** Koppel formulier: herbereken bij elke wijziging, bewaar invoer in de URL (deelbaar, geen cookies). */
export function bindForm(form, run) {
  noindexMetParams();
  const params = new URLSearchParams(location.search);
  if ([...params.keys()].length) {
    const vals = {};
    for (const [k, v] of params) vals[k] = v;
    writeForm(form, vals);
  }
  const go = () => {
    const v = readForm(form);
    try { run(v); } catch (e) { console.error(e); }
    const big = document.querySelector('.result .big'), mb = document.querySelector('.mobilebar [data-mirror]');
    if (big && mb) mb.textContent = big.textContent;
    const q = new URLSearchParams();
    for (const el of form.elements) {
      if (!el.name || el.dataset.nourl !== undefined) continue;
      if (el.type === 'checkbox') q.set(el.name, el.checked ? '1' : '0');
      else if (el.type === 'radio') { if (el.checked) q.set(el.name, el.value); }
      else if (el.type === 'hidden' && !el.value) continue;
      else q.set(el.name, el.value);
    }
    history.replaceState(null, '', `${location.pathname}?${q}`);
  };
  form.addEventListener('input', go);
  form.addEventListener('change', go);
  form.addEventListener('submit', (e) => { e.preventDefault(); go(); });
  go();
  return go;
}

export const $ = (sel, root = document) => root.querySelector(sel);
export function setText(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }
export function rows(tbody, list) {
  tbody.replaceChildren(...list.map(([label, value, cls]) => {
    const tr = document.createElement('tr'); if (cls) tr.className = cls;
    const a = document.createElement('td'); a.textContent = label;
    const b = document.createElement('td'); b.textContent = value;
    tr.append(a, b); return tr;
  }));
}

/** URL met invoer (querystring) niet laten indexeren: meta robots noindex en canonical naar de schone URL. */
export function noindexMetParams() {
  if (!location.search) return;
  let m = document.querySelector('meta[name="robots"]');
  if (!m) { m = document.createElement('meta'); m.name = 'robots'; document.head.append(m); }
  m.content = 'noindex, follow';
  let c = document.querySelector('link[rel="canonical"]');
  if (!c) { c = document.createElement('link'); c.rel = 'canonical'; document.head.append(c); }
  c.href = location.origin + location.pathname;
}
