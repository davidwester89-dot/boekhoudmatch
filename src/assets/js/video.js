import { track } from './consent.js';

// Klik om te laden: vóór de klik laadt er niets van de video (geen <video>, geen MP4, geen ondertitels).
// Desktop (vanaf 900px) krijgt de brede versie, mobiel de staande; beide met voice-over en dezelfde ondertitels.
// De klik start de video met geluid (niet automatisch); dempen kan met de knoppen van de speler.
// Events video_start en video_complete (met de pagina) gaan alleen mee na toestemming, via track() in consent.js.
const BREED = '(min-width: 900px)';
for (const box of document.querySelectorAll('[data-video]')) {
  const btn = box.querySelector('button');
  if (!btn) continue;
  btn.addEventListener('click', () => {
    const breed = matchMedia(BREED).matches;
    const v = document.createElement('video');
    v.controls = true;
    v.preload = 'none';
    v.playsInline = true;
    v.muted = false;
    v.setAttribute('playsinline', '');
    v.poster = breed ? box.dataset.poster : box.dataset.posterMobiel;
    v.setAttribute('aria-label', box.dataset.title || 'Video');
    const src = document.createElement('source');
    src.src = breed ? box.dataset.src : box.dataset.srcMobiel; src.type = 'video/mp4';
    const tr = document.createElement('track');
    tr.kind = 'subtitles'; tr.srclang = 'nl'; tr.label = 'Nederlands'; tr.src = box.dataset.vtt; tr.default = true;
    v.append(src, tr);
    const page = location.pathname;
    let started = false, done = false;
    v.addEventListener('play', () => { if (!started) { started = true; track('video_start', { page }); } });
    v.addEventListener('ended', () => { if (!done) { done = true; track('video_complete', { page }); } });
    box.replaceChildren(v);
    v.focus();
    v.play().catch(() => {});
  }, { once: true });
}
