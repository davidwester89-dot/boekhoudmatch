import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import kiezen from '../src/pages/kiezen.mjs';
import { home } from '../src/pages/static.mjs';

test('video op de match: klik om te laden, geen <video> of MP4 in de HTML', () => {
  assert.match(kiezen.body, /<div class="vid-box" data-video data-src="\/video\/boekhoudprogramma-kiezen-v3\.mp4" data-src-mobiel="\/video\/boekhoudprogramma-kiezen-mobiel-v3\.mp4" data-vtt="\/video\/boekhoudprogramma-kiezen-v2\.nl\.vtt"/);
  assert.doesNotMatch(kiezen.body, /<video|<track|autoplay|youtube/i);
  assert.ok(kiezen.scripts.includes('/js/video.js'));
  assert.ok(kiezen.body.indexOf('class="vid"') > kiezen.body.indexOf('</form>'), 'video staat (mobiel) onder het formulier');
  assert.ok(kiezen.body.indexOf('class="vid"') < kiezen.body.indexOf('id="uitkomst"'));
  assert.equal(kiezen.title, 'Boekhoudprogramma kiezen als zzp\'er | BoekhoudMatch');
  assert.match(kiezen.body, /<h1>Welk boekhoudprogramma past bij jou\?<\/h1>/);
});

test('VideoObject-schema met de afgesproken titel en beschrijving', () => {
  const v = kiezen.schema.find((x) => x['@type'] === 'VideoObject');
  assert.ok(v);
  assert.equal(v.name, 'Boekhoudprogramma kiezen als zzp\'er in 1 minuut');
  assert.equal(v.description, 'Beantwoord een paar vragen over je bedrijf en zie welk boekhoudprogramma bij je past. Zo werkt de gratis match van BoekhoudMatch.');
  assert.equal(v.contentUrl, 'https://boekhoudmatch.nl/video/boekhoudprogramma-kiezen-v3.mp4');
  assert.match(v.uploadDate, /^2026-10-19T\d\d:\d\d:00\+02:00$/);
  assert.match(v.duration, /^PT/);
  assert.ok(!('aggregateRating' in v));
});

test('homepage: alleen een thumbnail-link, geen embed', () => {
  assert.match(home.body, /<a class="vid-teaser" href="\/boekhoudprogramma-kiezen\/"><img src="\/video\/boekhoudprogramma-kiezen-480-v2\.webp"/);
  assert.doesNotMatch(home.body, /<video|data-video/);
});

test('videobestanden: MP4 onder 2 MB, VTT geldig, events alleen via track()', () => {
  for (const f of ['boekhoudprogramma-kiezen-v3.mp4', 'boekhoudprogramma-kiezen-mobiel-v3.mp4']) assert.ok(statSync('src/assets/video/' + f).size < 2.5 * 1024 * 1024, f);
  assert.match(readFileSync('src/assets/video/boekhoudprogramma-kiezen-v2.nl.vtt', 'utf8'), /^WEBVTT\n/);
  const js = readFileSync('src/assets/js/video.js', 'utf8');
  assert.match(js, /track\('video_start', \{ page \}\)/);
  assert.match(js, /track\('video_complete', \{ page \}\)/);
  assert.doesNotMatch(js, /gtag|autoplay/);
});
