(() => {
  const dismiss = () => {
    clearTimeout(window.diviLoaderTimeout);
    document.documentElement.classList.remove('is-loading');
  };
  const hero = document.querySelector('.hero-visual > img');
  const ready = hero && hero.decode ? hero.decode().catch(() => {}) : Promise.resolve();
  // Real image readiness with an independent, bounded escape timer in the head.
  ready.then(() => requestAnimationFrame(() => requestAnimationFrame(dismiss)));
  window.addEventListener('pageshow', event => { if (event.persisted) dismiss(); });
})();
