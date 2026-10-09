import { test } from 'node:test';
import assert from 'node:assert/strict';
import { box1Tax, algemeneHeffingskorting, arbeidskorting, zzpNetto, loondienstNetto, winstVoorNetto, uurtarief, uurtariefVanuitSalaris } from '../src/lib/zzp.js';

const near = (a, b, tol = 0.01, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ''} ${a} ≉ ${b}`);

test('box 1 schijven 2026 (Belastingdienst)', () => {
  near(box1Tax(0), 0);
  near(box1Tax(38883), 38883 * 0.3575);
  near(box1Tax(78426), 38883 * 0.3575 + (78426 - 38883) * 0.3756);
  near(box1Tax(100000), 38883 * 0.3575 + (78426 - 38883) * 0.3756 + (100000 - 78426) * 0.495);
});

test('algemene heffingskorting 2026', () => {
  near(algemeneHeffingskorting(20000), 3115);
  near(algemeneHeffingskorting(29736), 3115);
  near(algemeneHeffingskorting(50000), 3115 - 0.06398 * (50000 - 29736));
  near(algemeneHeffingskorting(78426), 0);
  near(algemeneHeffingskorting(90000), 0);
});

test('arbeidskorting 2026 knikpunten sluiten aan', () => {
  near(arbeidskorting(11965), 996, 0.6); // 8,324% x 11.965 = 995,97
  near(arbeidskorting(25845), 5300, 0.6); // 996 + 31,009% x 13.880 = 5.300,05
  near(arbeidskorting(45592), 5685, 0.6); // 5300 + 1,95% x 19.747 = 5.685,07
  near(arbeidskorting(132920), 0, 0.6);   // 5685 - 6,51% x 87.328 = 0,05
  near(arbeidskorting(150000), 0);
  near(arbeidskorting(-5), 0);
});

test('zzp €60.000 winst, urencriterium, geen starter (handberekening)', () => {
  const r = zzpNetto({ winst: 60000, urencriterium: true, starter: false });
  near(r.ondernemersaftrek, 1200);
  near(r.mkbVrijstelling, 0.127 * 58800);
  near(r.belastbareWinst, 58800 * 0.873);
  const bw = 58800 * 0.873;
  const tax = 38883 * 0.3575 + (bw - 38883) * 0.3756;
  const ahk = 3115 - 0.06398 * (bw - 29736);
  const ak = 5685 - 0.0651 * (60000 - 45592); // arbeidsinkomen = winst vóór OA/mkb
  near(r.tariefAanpassing, 0);
  near(r.inkomstenbelasting, tax - ahk - ak, 0.02);
  near(r.zvw, 0.0485 * bw, 0.02);
  near(r.netto, 60000 - (tax - ahk - ak) - 0.0485 * bw, 0.05);
  // ≈ € 45.414; rekenaars die arbeidskorting over belastbare winst nemen komen ~€ 564 hoger uit
  near(r.netto, 45414, 2);
});

test('tariefaanpassing bij hoge winst (11,94% over aftrekposten in toptarief)', () => {
  const r = zzpNetto({ winst: 150000, urencriterium: true });
  const aftrek = 1200 + 0.127 * 148800;
  const inkomenVoor = 148800 * 0.873 + aftrek; // = 150.000
  near(inkomenVoor, 150000, 0.01);
  near(r.tariefAanpassing, 0.1194 * Math.min(aftrek, 150000 - 78426), 0.02);
  near(r.arbeidskorting, 0);
  near(r.algemeneHeffingskorting, 0);
  near(r.zvw, 0.0485 * 79409, 0.01); // gemaximeerd
});

test('zelfstandigenaftrek niet hoger dan winst (geen starter), wel volledige startersaftrek', () => {
  const a = zzpNetto({ winst: 800, urencriterium: true, starter: false });
  near(a.zelfstandigenaftrek, 800);
  const b = zzpNetto({ winst: 800, urencriterium: true, starter: true });
  near(b.zelfstandigenaftrek, 1200);
  near(b.startersaftrek, 2123);
  assert.ok(b.belastbareWinst < 0);
  near(b.inkomstenbelasting, 0);
  near(b.zvw, 0);
});

test('zonder urencriterium geen ondernemersaftrek, wel mkb-vrijstelling', () => {
  const r = zzpNetto({ winst: 30000, urencriterium: false });
  near(r.ondernemersaftrek, 0);
  near(r.mkbVrijstelling, 3810);
});

test('kortingen nooit hoger dan belasting; netto nooit boven winst', () => {
  for (const w of [0, 5000, 15000, 25000]) {
    const r = zzpNetto({ winst: w, urencriterium: true });
    assert.ok(r.inkomstenbelasting >= 0);
    assert.ok(r.netto <= w + 1e-9);
  }
});

test('netto stijgt monotoon met winst', () => {
  let prev = -Infinity;
  for (let w = 0; w <= 250000; w += 2500) {
    const n = zzpNetto({ winst: w, urencriterium: true }).netto;
    assert.ok(n >= prev - 1e-6, `daling bij ${w}`);
    prev = n;
  }
});

test('inkomensvoorzieningen verlagen belasting maar niet arbeidskorting', () => {
  const a = zzpNetto({ winst: 70000, urencriterium: true });
  const b = zzpNetto({ winst: 70000, urencriterium: true, inkomensvoorzieningen: 3000 });
  assert.ok(b.inkomstenbelasting < a.inkomstenbelasting);
  near(b.arbeidskorting, a.arbeidskorting);
  near(b.zvw, a.zvw);
});

test('winstVoorNetto is inverse van zzpNetto', () => {
  const opts = { urencriterium: true, starter: false, inkomensvoorzieningen: 2400 };
  const w = winstVoorNetto(36000, opts);
  near(zzpNetto({ ...opts, winst: w }).nettoNaVoorzieningen, 36000, 0.05);
});

test('uurtarief: bekende invoer geeft consistente uitkomst', () => {
  const r = uurtarief({ doelNettoMaand: 3000, kostenJaar: 6000, aovMaand: 250, pensioenMaand: 200, werkweken: 44, urenPerWeek: 36, declarabelPct: 0.7 });
  near(r.totaalUren, 1584);
  assert.equal(r.urencriterium, true);
  near(r.declarabeleUren, 1108.8);
  near(r.detail.nettoNaVoorzieningen, 36000, 0.05);
  near(r.uurtariefExBtw, r.benodigdeOmzet / 1108.8, 0.01);
  near(r.uurtariefInclBtw, r.uurtariefExBtw * 1.21, 0.02);
});

test('loondienst netto (vereenvoudigd) en salaris-equivalent', () => {
  const ld = loondienstNetto({ brutoJaar: 50000 });
  const tax = 38883 * 0.3575 + (50000 - 38883) * 0.3756;
  const k = (3115 - 0.06398 * (50000 - 29736)) + (5685 - 0.0651 * (50000 - 45592));
  near(ld.netto, 50000 - (tax - k), 0.02);
  const r = uurtariefVanuitSalaris({ brutoMaand: 4000, vakantiegeldPct: 0.08, pensioenWerknemerPct: 0.05, kostenJaar: 4000, aovMaand: 250, pensioenMaand: 300, werkweken: 44, urenPerWeek: 36, declarabelPct: 0.75 });
  near(r.loondienst.brutoJaar, 4000 * 12 * 1.08);
  near(r.detail.nettoNaVoorzieningen, r.loondienst.netto, 0.05);
  assert.ok(r.uurtariefExBtw > 0);
});
