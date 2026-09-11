/* The nine forms, drifting behind the page.
   A fixed canvas below the content: the Navadurga artwork at low opacity,
   each panel on its own slow course, pulled by scroll and pushed by the
   pointer. It reads through the sections whose grounds are translucent —
   the ritual and the location stretches — and is simply covered by the ones
   that paint themselves opaque, which is the intent: presence, not wallpaper.

   Canvas 2D rather than a second WebGL context: nine drawImage calls a frame
   cost almost nothing, work everywhere, and need no library. */
(() => {
  const NIGHTS = 9, SETTLED = 'complete';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const conn = navigator.connection || {};
  if (conn.saveData || /2g/.test(conn.effectiveType || '')) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'page-backdrop';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  document.body.prepend(canvas);

  const shapes = [];
  let loaded = 0;
  for (let i = 1; i <= NIGHTS; i++) {
    const img = new Image();
    img.src = `assets/night-${i}.webp`;
    img.decoding = 'async';
    const a = (i / NIGHTS) * Math.PI * 2;
    shapes.push({
      img,
      // spread around the page rather than clustered in the middle
      x: 0.5 + Math.cos(a) * 0.36, y: (i - 0.5) / NIGHTS,
      scale: 0.38 + (i % 4) * 0.13,
      spin: (i % 2 ? 1 : -1) * 0.00016 * (1 + (i % 3)),
      rot: a * 0.3,
      drift: (i % 2 ? 1 : -1) * 0.000045 * (1 + (i % 3)),
      depth: 0.25 + (i % 5) * 0.16,      // how much scroll moves it
      px: 0, py: 0                        // pointer displacement, eased
    });
    img.onload = () => {
      const f = document.createElement('canvas');
      f.width = img.naturalWidth; f.height = img.naturalHeight;
      const fc = f.getContext('2d');
      fc.drawImage(img, 0, 0);
      fc.globalCompositeOperation = 'destination-in';
      const g = fc.createRadialGradient(f.width / 2, f.height / 2, 0,
                                        f.width / 2, f.height / 2, f.width * 0.58);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(0.55, 'rgba(0,0,0,0.85)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      fc.fillStyle = g; fc.fillRect(0, 0, f.width, f.height);
      shapes[i - 1].feathered = f;
      loaded++;
    };
  }

  let w = 0, h = 0, dpr = 1;
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 1.4);
    w = innerWidth; h = innerHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  addEventListener('resize', resize, { passive: true });

  let pointerX = 0.5, pointerY = 0.5, hasPointer = false;
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    addEventListener('pointermove', e => {
      pointerX = e.clientX / innerWidth; pointerY = e.clientY / innerHeight; hasPointer = true;
    }, { passive: true });
    addEventListener('pointerleave', () => { hasPointer = false; });
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    const scroll = scrollY;
    for (const s of shapes) {
      const art = s.feathered; if (!art) continue;
      // Its own slow course, plus parallax, plus a nudge away from the pointer.
      const baseX = s.x + Math.sin(t * s.drift * 1000 + s.rot) * 0.045;
      const span = h + 700;
      const raw = s.y * (h + 1400) - scroll * s.depth;
      const baseY = ((raw % span) + span) % span - 260;
      let dx = 0, dy = 0;
      if (hasPointer) {
        const ox = baseX - pointerX, oy = (baseY / h) - pointerY;
        const d2 = ox * ox + oy * oy + 0.03;
        dx = (ox / d2) * 0.014; dy = (oy / d2) * 0.014;
      }
      s.px += (dx - s.px) * 0.06; s.py += (dy - s.py) * 0.06;

      const iw = art.width * s.scale * (w / 1100) * 1.75;
      const ih = art.height * s.scale * (w / 1100) * 1.75;
      ctx.save();
      ctx.translate((baseX + s.px) * w, baseY + s.py * h);
      ctx.rotate(s.rot + t * s.spin);
      ctx.globalAlpha = 0.7;
      ctx.drawImage(art, -iw / 2, -ih / 2, iw, ih);
      ctx.restore();
    }
  }

  let running = true, t0 = performance.now();
  document.addEventListener('visibilitychange', () => { running = !document.hidden; });

  function frame(now) {
    requestAnimationFrame(frame);
    if (!running) return;
    draw((now - t0) / 1000);
  }

  const start = () => {
    if (reduce.matches) {                 // visible, but it does not move
      const settle = setInterval(() => { draw(0); if (loaded === NIGHTS) clearInterval(settle); }, 220);
      return;
    }
    requestAnimationFrame(frame);
  };
  if (document.readyState === SETTLED) start();
  else addEventListener('load', start, { once: true });
  reduce.addEventListener('change', () => location.reload());
})();
