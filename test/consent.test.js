import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  createConsent, readConsent, saveConsent, clearGaCookies, cleanUrl, cleanParams, CONSENT_KEY, CONSENT_VERSION,
} from '../src/lib/consent.js';

const ID = 'G-TEST12345';
const memStore = (init = {}) => { const m = new Map(Object.entries(init)); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), m }; };
/** Nep-document met een simpele cookiejar: een cookie met expires in het verleden wordt verwijderd. */
function fakeDoc(cookies = {}) {
  const jar = new Map(Object.entries(cookies));
  return {
    referrer: 'https://boekhoudmatch.nl/zzp-netto-inkomen/?omzet=85000',
    jar,
    get cookie() { return [...jar].map(([k, v]) => `${k}=${v}`).join('; '); },
    set cookie(s) { const [nv, ...attrs] = s.split(';'); const [n, v] = nv.split('='); if (attrs.some((a) => /expires=Thu, 01 Jan 1970/.test(a))) jar.delete(n.trim()); else jar.set(n.trim(), v); },
  };
}
function setup({ gaId = ID, store = memStore(), cookies = {}, now = new Date('2026-10-09T12:00:00Z') } = {}) {
  const loads = [];
  const win = { location: { href: 'https://boekhoudmatch.nl/zzp-uurtarief/?omzet=85000&kosten=5000#x' } };
  const doc = fakeDoc(cookies);
  const c = createConsent({ gaId, storage: store, doc, win, hostname: 'boekhoudmatch.nl', load: (src) => loads.push(src), now: () => now });
  return { c, loads, win, doc, store };
}
const GA_COOKIES = { _ga: 'GA1.1.123.456', _ga_TEST12345: 'GS1.1.789', other: 'keep' };

test('zonder keuze: melding tonen, gtag.js niet laden, geen events', () => {
  const { c, loads, win } = setup();
  assert.equal(c.init(), true);
  assert.equal(loads.length, 0);
  assert.equal(c.loaded, false);
  assert.equal(c.track('quiz_start', {}), false);
  assert.equal(win.dataLayer, undefined);
});

test('accepteren: gtag.js wordt pas dan geladen, met privacy-instellingen en zonder invoer uit de URL', () => {
  const { c, loads, win, store } = setup();
  c.init();
  c.accept();
  assert.deepEqual(loads, [`https://www.googletagmanager.com/gtag/js?id=${ID}`]);
  const saved = JSON.parse(store.getItem(CONSENT_KEY));
  assert.equal(saved.v, CONSENT_VERSION);
  assert.equal(saved.choice, 'granted');
  assert.equal(saved.date, '2026-10-09T12:00:00.000Z');
  const cfg = win.dataLayer.map((a) => [...a]).find((a) => a[0] === 'config');
  assert.equal(cfg[1], ID);
  assert.equal(cfg[2].allow_google_signals, false);
  assert.equal(cfg[2].allow_ad_personalization_signals, false);
  assert.equal(cfg[2].page_location, 'https://boekhoudmatch.nl/zzp-uurtarief/');
  assert.equal(cfg[2].page_referrer, 'https://boekhoudmatch.nl/zzp-netto-inkomen/');
  assert.ok(win.dataLayer.some((a) => a[0] === 'set' && a[1] === 'ads_data_redaction' && a[2] === true));
  const def = win.dataLayer.find((a) => a[0] === 'consent' && a[1] === 'default');
  assert.equal(def[2].ad_storage, 'denied');
  assert.equal(c.track('vendor_click', { vendor: 'Moneybird', page: '/x/', omzet: 85000 }), true);
  const ev = win.dataLayer.at(-1);
  assert.deepEqual([...ev], ['event', 'vendor_click', { vendor: 'Moneybird', page: '/x/' }]);
  c.accept();
  assert.equal(loads.length, 1, 'script maar één keer laden');
});

test('weigeren: niets laden, keuze bewaard, geen melding meer bij volgende pagina', () => {
  const { c, loads, store } = setup({ cookies: GA_COOKIES });
  c.init();
  c.reject();
  assert.equal(loads.length, 0);
  assert.equal(JSON.parse(store.getItem(CONSENT_KEY)).choice, 'denied');
  const next = setup({ store, cookies: GA_COOKIES });
  assert.equal(next.c.init(), false);
  assert.equal(next.loads.length, 0);
  assert.deepEqual([...next.doc.jar.keys()], ['other'], 'oude _ga-cookies worden gewist');
});

test('eerdere toestemming: volgende pagina laadt GA direct, zonder melding', () => {
  const store = memStore();
  saveConsent(store, 'granted', new Date('2026-09-01T00:00:00Z'));
  const { c, loads } = setup({ store });
  assert.equal(c.init(), false);
  assert.equal(loads.length, 1);
});

test('intrekken: GA stopt, _ga-cookies weg, geen events meer', () => {
  const { c, win, doc } = setup({ cookies: GA_COOKIES });
  c.init();
  c.accept();
  c.reject();
  assert.equal(win[`ga-disable-${ID}`], true);
  assert.deepEqual([...doc.jar.keys()], ['other']);
  assert.ok(win.dataLayer.some((a) => a[0] === 'consent' && a[1] === 'update' && a[2].analytics_storage === 'denied'));
  const n = win.dataLayer.length;
  assert.equal(c.track('quiz_start', {}), false);
  assert.equal(win.dataLayer.length, n);
  c.accept();
  assert.equal(win[`ga-disable-${ID}`], false, 'opnieuw toestaan werkt weer');
  assert.equal(c.track('quiz_start', {}), true);
});

test('keuze verloopt na 12 maanden en bij een nieuwe versie', () => {
  const now = new Date('2026-10-09T12:00:00Z');
  const s1 = memStore();
  saveConsent(s1, 'granted', new Date('2025-10-01T00:00:00Z'));
  assert.equal(readConsent(s1, now), null);
  const s2 = memStore({ [CONSENT_KEY]: JSON.stringify({ v: CONSENT_VERSION - 1, choice: 'granted', date: '2026-10-01T00:00:00Z' }) });
  assert.equal(readConsent(s2, now), null);
  const s3 = memStore({ [CONSENT_KEY]: 'kapot{' });
  assert.equal(readConsent(s3, now), null);
  const s4 = memStore({ [CONSENT_KEY]: JSON.stringify({ v: CONSENT_VERSION, choice: 'ja', date: '2026-10-01T00:00:00Z' }) });
  assert.equal(readConsent(s4, now), null);
  const expired = setup({ store: s1 });
  assert.equal(expired.c.init(), true, 'verlopen: opnieuw vragen');
  assert.equal(expired.loads.length, 0, 'verlopen: niet laden');
});

test('zonder GA_ID: geen melding, niets laden, ook niet na accept', () => {
  for (const gaId of ['', 'UA-123', 'G-']) {
    const { c, loads } = setup({ gaId });
    assert.equal(c.enabled, false);
    assert.equal(c.init(), false);
    c.accept();
    assert.equal(loads.length, 0);
    assert.equal(c.track('quiz_start'), false);
  }
});

test('localStorage geblokkeerd: geen crash, niet laden zonder klik', () => {
  const store = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  const { c, loads } = setup({ store });
  assert.equal(c.init(), true);
  assert.equal(loads.length, 0);
  c.accept();
  assert.equal(loads.length, 1);
});

test('hulpfuncties: cookies wissen op subdomein, URL en parameters opschonen', () => {
  const doc = fakeDoc({ _ga: '1', _gid: '2', _gat_x: '3', _ga_ABC: '4', bm: '5' });
  const writes = [];
  const spy = { get cookie() { return doc.cookie; }, set cookie(v) { writes.push(v); doc.cookie = v; } };
  assert.deepEqual(clearGaCookies(spy, 'www.boekhoudmatch.nl').sort(), ['_ga', '_ga_ABC', '_gat_x', '_gid']);
  assert.ok(writes.some((w) => w.includes('domain=.boekhoudmatch.nl')));
  assert.ok(writes.some((w) => w.includes('domain=.www.boekhoudmatch.nl')));
  assert.deepEqual([...doc.jar.keys()], ['bm']);
  assert.equal(cleanUrl('https://boekhoudmatch.nl/a/?omzet=1#b'), 'https://boekhoudmatch.nl/a/');
  assert.equal(cleanUrl(''), '');
  assert.deepEqual(cleanParams({ vendor: 'x'.repeat(150), inkomen: 50000, leeg: '' }), { vendor: 'x'.repeat(100) });
});

// Gebouwde HTML: met lege GA_ID geen spoor van Google; met ID alleen het eigen script (gtag laadt pas na klik).
const render = (gaId) => execFileSync(process.execPath, ['--input-type=module', '-e', `
  const { layout } = await import('./src/layout.mjs');
  const S = await import('./src/pages/static.mjs');
  process.stdout.write(layout({ ...S.home, body: S.home.body.replace('{{latest}}', '') }) + '\\n@@@\\n' + layout(S.privacy));
`], { env: { ...process.env, GA_ID: gaId }, cwd: new URL('..', import.meta.url) }).toString();

test('build zonder GA_ID: geen banner, geen Google, geen cookietekst over Analytics', () => {
  const html = render('');
  assert.doesNotMatch(html, /googletagmanager|google-analytics|data-ga=|consent\.js|Cookie-instellingen|data-consent-open/);
  assert.doesNotMatch(html.split('\n@@@\n')[0], /geen cookies|zonder cookies/i, 'home: geen claim die straks niet meer klopt');
});

test('build met GA_ID: consent-script en CSP, geen gtag.js in de HTML, privacypagina compleet', () => {
  const html = render(ID);
  const [home, privacy] = html.split('\n@@@\n');
  assert.match(home, /<script type="module" src="\/js\/consent\.js"><\/script>/);
  assert.match(home, new RegExp(`<body[^>]* data-ga="${ID}"`));
  assert.match(home, /script-src 'self' https:\/\/www\.googletagmanager\.com;/);
  assert.match(home, /connect-src 'self' https:\/\/\*\.google-analytics\.com/);
  assert.doesNotMatch(home, /<script[^>]+src="https:\/\/www\.googletagmanager/);
  assert.match(home, /data-consent-open>Cookie-instellingen</);
  for (const s of ['_ga', '_ga_TEST12345', '14 maanden', 'Data Privacy Framework', 'Google Ireland', 'id="cookies"', 'Weigeren']) assert.ok(privacy.includes(s), s);
  for (const h of [home, privacy]) assert.doesNotMatch(h.replace(/<script[\s\S]*?<\/script>/g, ''), /geen cookies|zonder cookies/i);
  assert.throws(() => execFileSync(process.execPath, ['--input-type=module', '-e', "await import('./src/layout.mjs')"], { env: { ...process.env, GA_ID: 'UA-1' }, cwd: new URL('..', import.meta.url), stdio: 'pipe' }));
});
