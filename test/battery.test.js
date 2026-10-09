import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { decodeHourly, simuleer, terugverdientijd, batterijAnalyse, prijsModel } from '../src/lib/battery.js';

const near = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b}`);
const json = JSON.parse(readFileSync(new URL('../src/assets/data/hourly-2025.json', import.meta.url)));
const d = decodeHourly(json);
const vast = { type: 'vast', allIn: 0.26, vergoeding: 0.084, terugleverkosten: 0.0489 };

test('dataset: 8760 uur, fracties sommeren tot 1', () => {
  assert.equal(d.n, 8760);
  near(d.load.reduce((a, b) => a + b, 0), 1, 1e-9);
  near(d.pv.reduce((a, b) => a + b, 0), 1, 1e-9);
  assert.ok(d.pv.every((x) => x >= 0));
  assert.ok(json.meta.epexAvg > 0.03 && json.meta.epexAvg < 0.2);
});

test('energiebalans zonder batterij: verbruik = direct + afname; opwek = direct + teruglevering', () => {
  const r = simuleer(d, { verbruik: 3500, opwek: 3000, capaciteit: 0, contract: vast });
  near(r.directEigenVerbruik + r.afname, 3500, 0.05);
  near(r.directEigenVerbruik + r.teruglevering, 3000, 0.05);
  assert.ok(r.zelfconsumptie > 0.15 && r.zelfconsumptie < 0.6, `zelfconsumptie ${r.zelfconsumptie}`);
});

test('energiebalans met batterij inclusief verliezen', () => {
  const r = simuleer(d, { verbruik: 3500, opwek: 3000, capaciteit: 5, vermogen: 2.5, rendement: 0.9, contract: vast });
  near(r.directEigenVerbruik + r.uitBatterij + r.afname, 3500, 0.05);
  // opwek = direct + in batterij + terug
  near(r.directEigenVerbruik + r.inBatterij + r.teruglevering, 3000, 0.05);
  assert.ok(r.uitBatterij <= r.inBatterij * 0.9 + 5.01); // eindlading max 5 kWh
  assert.ok(r.cycli > 50 && r.cycli < 366);
});

test('batterij bespaart bij vast contract met lage terugleverwaarde', () => {
  const a = batterijAnalyse(d, { verbruik: 3500, opwek: 3500, capaciteit: 5, vermogen: 2.5, rendement: 0.9, contract: vast, investering: 4000 });
  assert.ok(a.besparing > 0);
  // besparing per verschoven kWh ≈ allIn*eta - netTerug
  const perKwh = a.besparing / a.met.uitBatterij;
  assert.ok(perKwh < 0.26 && perKwh > 0.1, `perKwh ${perKwh}`);
});

test('geen zonnepanelen + alleen zelfverbruik-sturing = geen besparing', () => {
  const a = batterijAnalyse(d, { verbruik: 3500, opwek: 0, capaciteit: 5, vermogen: 2.5, rendement: 0.9, contract: vast, investering: 4000 });
  near(a.besparing, 0);
  assert.equal(a.terugverdienJaar, null);
});

test('meer vermogen/capaciteit nooit slechter (monotoon)', () => {
  const base = { verbruik: 4000, opwek: 4000, rendement: 0.9, contract: vast };
  const s1 = simuleer(d, { ...base, capaciteit: 2.7, vermogen: 0.8 }).kosten;
  const s2 = simuleer(d, { ...base, capaciteit: 5, vermogen: 2.5 }).kosten;
  const s3 = simuleer(d, { ...base, capaciteit: 10, vermogen: 5 }).kosten;
  assert.ok(s1 >= s2 - 0.01 && s2 >= s3 - 0.01);
});

test('dynamisch prijsmodel', () => {
  const pm = prijsModel({ type: 'dynamisch', inkoopOpslag: 0.02, terugleverkosten: 0.0124, terugleveringInclBtw: false }, 2027);
  near(pm.afname(0.10), (0.10 + 0.02 + 0.088) * 1.21, 1e-12);
  near(pm.terug(0.10), 0.10 - 0.0124, 1e-12);
  const r = simuleer(d, { verbruik: 3500, opwek: 3000, capaciteit: 0, contract: { type: 'dynamisch', inkoopOpslag: 0.02 } });
  assert.ok(Number.isFinite(r.kosten));
});

test('terugverdientijd: zonder degradatie = investering / besparing', () => {
  const t = terugverdientijd({ besparingJaar1: 500, investering: 2000, degradatie: 0, levensduur: 15 });
  near(t.terugverdienJaar, 4);
  const t2 = terugverdientijd({ besparingJaar1: 100, investering: 5000, degradatie: 0.02, levensduur: 15 });
  assert.equal(t2.terugverdienJaar, null);
  const t3 = terugverdientijd({ besparingJaar1: 500, investering: 2000, degradatie: 0.02 });
  assert.ok(t3.terugverdienJaar > 4 && t3.terugverdienJaar < 4.3);
});

import { verschovenProfiel, kalibreerProfiel, directZelfverbruik } from '../src/lib/battery.js';
test('kalibratie: verschoven profiel behoudt jaarverbruik en raakt doel-zelfverbruik', () => {
  const p = verschovenProfiel(d, 0.5);
  near(p.reduce((a, b) => a + b, 0), 1, 1e-9);
  const k = kalibreerProfiel(d, 3500, 3200, 0.30);
  near(k.bereikt, 0.30, 0.002);
  const r = simuleer(d, { verbruik: 3500, opwek: 3200, capaciteit: 0, contract: vast, loadProfiel: k.profiel });
  near(r.directEigenVerbruik / 3200, 0.30, 0.002);
  near(r.directEigenVerbruik + r.afname, 3500, 0.05);
  // doel boven maximum → ongewijzigd profiel
  const k2 = kalibreerProfiel(d, 3500, 3200, 0.95);
  assert.equal(k2.alpha, 0);
  near(directZelfverbruik(d, 3500, 3200, d.load), k2.bereikt, 1e-9);
});
