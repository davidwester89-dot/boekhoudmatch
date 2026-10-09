import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vergelijkSalderen, kaalUitAllIn, allInUitKaal, minimumVergoeding, besparingMeerEigenVerbruik } from '../src/lib/saldering.js';

const near = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b}`);

test('prijsopbouw: CBS aug 2026 all-in ↔ kaal', () => {
  // CBS: kaal 0,1214 excl btw; EB 0,09161 excl btw → all-in incl btw 0,2577
  near(allInUitKaal(0.1214, 2026), (0.1214 + 0.09161) * 1.21, 1e-9);
  near(kaalUitAllIn(allInUitKaal(0.1214, 2026), 2026), 0.1214, 1e-9);
  near(allInUitKaal(0.1214, 2026), 0.25775, 0.0001);
});

test('wettelijk minimum = 50% kale prijs', () => {
  near(minimumVergoeding(0.12), 0.06, 1e-12);
});

test('volledige saldering 2026: afname > teruglevering', () => {
  const r = vergelijkSalderen({ afname: 3000, teruglevering: 2000, kaalExBtw: 0.12, vergoeding2026: 0.07, vergoeding2027: 0.06, terugleverkosten2027: 0 });
  const p26 = (0.12 + 0.09161) * 1.21, p27 = (0.12 + 0.088) * 1.21;
  near(r.kosten2026, 1000 * p26);
  near(r.kosten2027, 3000 * p27 - 2000 * 0.06);
  assert.equal(r.vergoedingOnderMinimum, false);
});

test('overschot 2026: teruglevering > afname krijgt vergoeding', () => {
  const r = vergelijkSalderen({ afname: 2000, teruglevering: 3000, kaalExBtw: 0.12, vergoeding2026: 0.07, terugleverkosten2026Kwh: 0.01, vergoeding2027: 0.08, terugleverkosten2027: 0.05 });
  near(r.kosten2026, 0 - 1000 * 0.07 + 3000 * 0.01);
  const p27 = (0.12 + 0.088) * 1.21;
  near(r.kosten2027, 2000 * p27 - 3000 * 0.08 + 3000 * 0.05);
  near(r.verschil, r.kosten2027 - r.kosten2026);
});

test('signaleert vergoeding onder wettelijk minimum', () => {
  const r = vergelijkSalderen({ afname: 3000, teruglevering: 2000, kaalExBtw: 0.12, vergoeding2027: 0.05 });
  assert.equal(r.vergoedingOnderMinimum, true);
});

test('waarde eigen verbruik en geen zonnepanelen = geen verschil behalve EB-tarief', () => {
  const r = vergelijkSalderen({ afname: 2500, teruglevering: 0, kaalExBtw: 0.12 });
  near(r.verschil, 2500 * (0.088 - 0.09161) * 1.21);
  const r2 = vergelijkSalderen({ afname: 3000, teruglevering: 2500, kaalExBtw: 0.12, vergoeding2027: 0.084, terugleverkosten2027: 0.0489 });
  near(besparingMeerEigenVerbruik(r2, 500), 500 * ((0.12 + 0.088) * 1.21 - (0.084 - 0.0489)));
});

test('negatieve en lege invoer worden als 0 behandeld', () => {
  const r = vergelijkSalderen({ afname: -5, teruglevering: 'x', kaalExBtw: 0.1 });
  near(r.kosten2026, 0); near(r.kosten2027, 0);
});
