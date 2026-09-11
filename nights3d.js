/* The nine nights, as a corridor.
   The rail stays exactly what it was — the same DOM, the same arrows, the same
   keyboard route, the same order. This only adds depth to it: frames near the
   centre of the rail stand forward and face you, frames toward the edges fall
   back and turn away, so scrolling it reads as travelling down a row of
   gateways rather than sliding a strip sideways.

   GSAP is used for what it is actually good at here — quickTo, which keeps a
   smoothed value per property per element without a tween being created on
   every scroll event.

   Never loaded under reduced motion, Save-Data or 2G. If it does not arrive,
   the rail is the flat rail it already was. */
(() => {
  const rail = document.querySelector('#night-rail');
  if (!rail) return;
  const conn = navigator.connection || {};
  if (matchMedia('(prefers-reduced-motion: reduce)').matches ||
      conn.saveData || /2g/.test(conn.effectiveType || '')) return;

  const GSAP = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';

  function boot() {
    const gsap = window.gsap;
    if (!gsap) return;
    const frames = [...rail.querySelectorAll('.night-frame')];
    if (!frames.length) return;

    rail.classList.add('is-corridor');
    const set = frames.map(f => ({
      el: f,
      z: gsap.quickTo(f, 'z', { duration: 0.5, ease: 'power3' }),
      ry: gsap.quickTo(f, 'rotationY', { duration: 0.5, ease: 'power3' }),
      o: gsap.quickTo(f, 'opacity', { duration: 0.5, ease: 'power2' })
    }));

    let queued = false;
    function place() {
      queued = false;
      const rect = rail.getBoundingClientRect();
      const mid = rect.left + rect.width / 2;
      for (const s of set) {
        const b = s.el.getBoundingClientRect();
        // -1 at the left edge of the rail, 0 dead centre, +1 at the right.
        const d = Math.max(-1.6, Math.min(1.6, ((b.left + b.width / 2) - mid) / (rect.width / 2)));
        const a = Math.abs(d);
        s.z(-98 * a * a);                  // falls back toward the edges
        s.el.style.zIndex = String(60 - Math.round(a * 40));
        s.ry(-15 * d);                     // and turns to face the centre
        s.o(1 - 0.3 * a * a);
      }
    }
    const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(place); } };

    rail.addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    new ResizeObserver(schedule).observe(rail);
    place();
  }

  const load = () => {
    if (window.gsap) return boot();
    const s = document.createElement('script');
    s.src = GSAP; s.async = true;
    s.onload = boot;
    s.onerror = () => {};
    document.head.append(s);
  };
  if (document.readyState === 'complete') load();
  else addEventListener('load', load, { once: true });
})();
