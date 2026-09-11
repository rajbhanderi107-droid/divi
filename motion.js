/* Divi motion — ported from WhiteDot's cinematic-v2 motion library.
   Same durations, same easings, same hard rules:
     - transform and opacity only, never layout
     - IntersectionObserver to trigger, rAF-throttled scroll work
     - everything pauses off-screen and on a hidden tab
     - degrades to static, visible content: nothing can get stuck invisible

   The premium flag is set synchronously in the head, before first paint, so
   elements are never painted visible and then hidden again. Without it — no
   JS, reduced motion, Save-Data, 2G — every rule below is inert and the page
   is simply the page. */
(() => {
  const root = document.documentElement;
  if (root.dataset.motion !== 'on') return;   // the head script decides; this only obeys

  /* WhiteDot's tokens, unchanged. */
  const DURATION = { fast: 180, base: 320, slow: 620 };
  const SAFETY = 1800;                         // never leave content hidden

  /* ---- reveal: add .is-in when it comes into view ------------------ */
  function reveal(selector, { threshold = 0.18, rootMargin = '0px 0px -8% 0px' } = {}) {
    const nodes = [...document.querySelectorAll(selector)];
    if (!nodes.length) return;
    if (typeof IntersectionObserver === 'undefined') {
      nodes.forEach(n => n.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    }, { threshold, rootMargin });
    nodes.forEach(n => io.observe(n));

    /* A hash jump or layout churn can carry an element through the viewport
       in one frame and miss the callback entirely. WhiteDot's safety net:
       force everything in after a grace period so text can never be stuck. */
    setTimeout(() => nodes.forEach(n => n.classList.add('is-in')), SAFETY);
  }

  /* ---- stagger: index the children so CSS can delay them ----------- */
  function stagger(selector) {
    for (const group of document.querySelectorAll(selector)) {
      [...group.children].forEach((child, i) => child.style.setProperty('--stagger-i', String(i)));
    }
    reveal(selector, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });
  }

  /* ---- parallax: one custom property, transform handled in CSS ----- */
  function parallax(selector, distance = 40) {
    const nodes = [...document.querySelectorAll(selector)];
    if (!nodes.length || innerWidth <= 767) return;   // not on phones
    let scheduled = false;
    const live = new Set();

    const compute = () => {
      scheduled = false;
      const vh = innerHeight || 1;
      for (const el of live) {
        const r = el.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
        el.style.setProperty('--parallax', ((p - 0.5) * 2 * distance).toFixed(2) + 'px');
      }
    };
    const schedule = () => {
      if (scheduled || !live.size || document.hidden) return;
      scheduled = true; requestAnimationFrame(compute);
    };
    const io = new IntersectionObserver(entries => {
      for (const e of entries) e.isIntersecting ? live.add(e.target) : live.delete(e.target);
      schedule();
    }, { threshold: 0 });
    nodes.forEach(n => io.observe(n));
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule);
    compute();
  }

  reveal('.rv');
  stagger('.rv-group');
  parallax('.px-slow', 34);
  parallax('.px-fast', 64);

  root.dataset.motionReady = 'on';
  window.DIVI_MOTION = { DURATION, reveal, stagger, parallax };
})();
