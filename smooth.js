/* Smooth scrolling, matching divigarba.vercel.app — which runs Lenis, and it
   is most of why that build feels the way it does.

   Lenis scrolls the window natively (it is not a transform hijack), so
   `scrollY` stays true and every native `scroll` listener on this site keeps
   working: the reading-progress bar, the parallax, the backdrop's drift and
   the rail observers all carry on untouched.

   Never loaded under reduced motion, Save-Data or 2G. If it fails to arrive
   the page scrolls the way the browser scrolls it, which is a perfectly good
   outcome — nothing here depends on it. */
(() => {
  const conn = navigator.connection || {};
  if (matchMedia('(prefers-reduced-motion: reduce)').matches ||
      conn.saveData || /2g/.test(conn.effectiveType || '')) return;

  const SRC = 'https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.min.js';

  function boot() {
    const Lenis = window.Lenis;
    if (typeof Lenis !== 'function') return;

    const lenis = new Lenis({
      duration: 1.05,
      // A long, decelerating tail — the same shape as the site's --ease-out.
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6
    });

    let raf = 0;
    const tick = time => { lenis.raf(time); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);

    /* Anchor links have to go through Lenis or they hard-jump past the
       animation. The terms dialog opens off #terms and must not be hijacked. */
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute('href');
      if (!hash || hash === '#' || hash === '#terms') return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -92 });        // clear the sticky header
      history.pushState(null, '', hash);
    });

    /* A dialog scrolls its own content; Lenis must let go while one is open. */
    for (const dialog of document.querySelectorAll('dialog')) {
      dialog.addEventListener('close', () => lenis.start());
      new MutationObserver(() => dialog.open ? lenis.stop() : lenis.start())
        .observe(dialog, { attributes: true, attributeFilter: ['open'] });
    }

    window.DIVI_LENIS = lenis;
  }

  const load = () => {
    const s = document.createElement('script');
    s.src = SRC; s.async = true;
    s.onload = boot;
    s.onerror = () => {};
    document.head.append(s);
  };
  if (document.readyState === 'complete') load();
  else addEventListener('load', load, { once: true });
})();
