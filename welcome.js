(() => {
  const root = document.documentElement;
  const seen = window.diviIntroSeen === true;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Let the diya-lighting intro finish on a first visit; skip it on later pages in the same session.
  const minimum = seen ? 0 : reduced ? 500 : 2300;
  const dismiss = () => {
    clearTimeout(window.diviLoaderTimeout);
    root.classList.remove('is-loading', 'intro-pending');
    root.classList.add('intro-done');
    try { sessionStorage.setItem('divi-intro', '1'); } catch {}
  };
  const hero = document.querySelector('.hero-visual > img');
  const ready = hero && hero.decode ? hero.decode().catch(() => {}) : Promise.resolve();
  const wait = new Promise(resolve => setTimeout(resolve, Math.max(0, minimum - performance.now())));
  Promise.all([ready, wait]).then(() => requestAnimationFrame(() => requestAnimationFrame(dismiss)));
  window.addEventListener('pageshow', event => { if (event.persisted) dismiss(); });
})();
