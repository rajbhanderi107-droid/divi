/* The canopy over the hero.

   Divi's ceiling is the best thing Divi has built — a bamboo dome hung with
   block-printed panels, their hems zig-zagging around the ring into a row of
   points, string lights fanning out from it across the whole ground. An earlier
   attempt rebuilt it procedurally in three.js and the honest verdict was that
   it looked like a mess: no amount of shader work was going to arrive at that
   ceiling by guessing at it.

   So this does not rebuild the canopy. It hangs the real one over the hero,
   cut from the photograph, and spends its effort on the one thing a still
   photograph cannot do — the light. Every bulb in the picture was found by
   walking the pixels for warm local maxima, 361 of them, and each gets a soft
   additive glow that breathes on its own phase. The ceiling drifts as you
   scroll and leans as you move the pointer, so it sits in the page with depth
   rather than being pasted onto it.

   The photograph's own background is very nearly black, so the whole layer is
   composited onto the obsidian hero with screen blending: the night in the
   picture disappears into the night on the page, and what is left is the
   canopy, apparently built into the site. */
(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  // Normalised to the crop: [x, y, brightness]. Positions are measured from
  // the image itself, so the glows stay registered at any rendered size.
  const BULBS = [[0.65167,0.35863,1],[0.74167,0.41518,1],[0.59722,0.30506,1],[0.20944,0.48065,1],[0.27056,0.03125,1],[0.36167,0.24554,1],[0.33833,0.56696,1],[0.68389,0.51935,1],[0.28944,0.29613,1],[0.54833,0.55506,1],[0.21722,0.54018,1],[0.67167,0.57887,1],[0.36722,0.75744,1],[0.24056,0.35565,1],[0.53833,0.76339,1],[0.53056,0.25149,1],[0.30167,0.68006,1],[0.37278,0.53423,1],[0.37611,0.68601,1],[0.55056,0.73958,1],[0.235,0.59077,1],[0.40056,0.65625,1],[0.51944,0.76042,1],[0.38611,0.77232,1],[0.44389,0.23065,1],[0.50722,0.53423,1],[0.27389,0.4003,1],[0.28167,0.38839,1],[0.29278,0.37351,1],[0.65278,0.61756,1],[0.98278,0.01935,1],[0.60389,0.68601,1],[0.80611,0.28125,1],[0.15056,0.34375,1],[0.53278,0.33482,1],[0.54611,0.67113,1],[0.52278,0.32887,1],[0.67833,0.4122,1],[0.26722,0.4122,1],[0.52167,0.64732,1],[0.41278,0.52232,1],[0.33611,0.3378,1],[0.89167,0.03125,1],[0.935,0.0253,1],[0.51278,0.32292,1],[0.435,0.76935,1],[0.54278,0.34077,0.997],[0.60389,0.05208,0.992],[0.32722,0.34375,0.991],[0.34944,0.32887,0.99],[0.35944,0.32292,0.989],[0.97056,0.17708,0.987],[0.065,0.17113,0.985],[0.41167,0.30804,0.982],[0.40389,0.30804,0.98],[0.50056,0.31696,0.976],[0.56944,0.35863,0.971],[0.47056,0.30804,0.966],[0.46056,0.30804,0.964],[0.36944,0.31696,0.964],[0.58056,0.36756,0.962],[0.55278,0.34673,0.962],[0.38722,0.31101,0.961],[0.93167,0.17411,0.95],[0.42944,0.30506,0.946],[0.68722,0.47173,0.944],[0.43944,0.30506,0.943],[0.975,0.3378,0.938],[0.31833,0.3497,0.937],[0.215,0.41518,0.936],[0.37833,0.31399,0.935],[0.56167,0.35268,0.93],[0.45278,0.30804,0.924],[0.48167,0.31101,0.918],[0.58833,0.37351,0.916],[0.30833,0.35863,0.91],[0.395,0.31101,0.91],[0.89833,0.16815,0.909],[0.41944,0.30804,0.898],[0.66389,0.5253,0.893],[0.44167,0.65327,0.889],[0.67944,0.13839,0.867],[0.395,0.75446,0.865],[0.62833,0.42411,0.856],[0.30056,0.36756,0.855],[0.01722,0.27827,0.854],[0.89278,0.30208,0.853],[0.84389,0.43304,0.844],[0.49278,0.31399,0.844],[0.60944,0.39435,0.838],[0.48167,0.72768,0.833],[0.59722,0.38244,0.831],[0.91833,0.31399,0.83],[0.61944,0.40923,0.82],[0.26056,0.42708,0.818],[0.86278,0.45089,0.817],[0.86611,0.29018,0.8],[0.80167,0.50744,0.781],[0.63722,0.43899,0.764],[0.94611,0.32589,0.758],[0.95944,0.52827,0.735],[0.64944,0.46577,0.726],[0.37722,0.70685,0.721],[0.54944,0.76042,0.717],[0.88278,0.46577,0.702],[0.80833,0.18006,0.701],[0.92056,0.49851,0.7],[0.48167,0.68304,0.697],[0.97944,0.54018,0.693],[0.02611,0.41518,0.692],[0.94056,0.51339,0.685],[0.845,0.56101,0.683],[0.25278,0.44494,0.675],[0.35833,0.76339,0.672],[0.245,0.55506,0.671],[0.81611,0.5253,0.662],[0.64389,0.45089,0.644],[0.24722,0.61161,0.64],[0.68611,0.54911,0.634],[0.83056,0.54315,0.619],[0.45056,0.72173,0.618],[0.57056,0.97768,0.613],[0.86056,0.57589,0.603],[0.24722,0.46577,0.602],[0.92611,0.6503,0.585],[0.71722,0.64435,0.583],[0.93944,0.66518,0.579],[0.97611,0.70089,0.575],[0.87278,0.59077,0.575],[0.95278,0.67411,0.573],[0.89944,0.62054,0.573],[0.90278,0.48065,0.57],[0.04389,0.56696,0.568],[0.655,0.63839,0.56],[0.08056,0.29613,0.556],[0.56611,0.95982,0.553],[0.09167,0.51935,0.553],[0.67944,0.44494,0.546],[0.04944,0.4003,0.545],[0.01389,0.60268,0.543],[0.50167,0.97768,0.542],[0.91389,0.63542,0.52],[0.37056,0.77827,0.506],[0.23833,0.61458,0.501],[0.65611,0.48661,0.497],[0.31278,0.70089,0.48],[0.66722,0.59673,0.479],[0.305,0.69792,0.476],[0.68833,0.50149,0.472],[0.74167,0.33482,0.466],[0.36611,0.97173,0.463],[0.02833,0.58482,0.463],[0.88722,0.60565,0.46],[0.53389,0.78125,0.458],[0.39056,0.79018,0.458],[0.04722,0.73363,0.456],[0.03833,0.74554,0.455],[0.80056,0.66518,0.453],[0.29389,0.97173,0.452],[0.70833,0.96875,0.441],[0.05611,0.72173,0.428],[0.33278,0.59077,0.422],[0.96278,0.68899,0.421],[0.98833,0.70982,0.42],[0.21056,0.9747,0.417],[0.125,0.95685,0.415],[0.67389,0.60565,0.415],[0.55833,0.74554,0.407],[0.62944,0.97173,0.407],[0.29722,0.31696,0.398],[0.855,0.74851,0.397],[0.05944,0.19494,0.392],[0.81056,0.9628,0.392],[0.73167,0.67708,0.382],[0.81056,0.68006,0.382],[0.88611,0.79018,0.378],[0.77056,0.61458,0.376],[0.24278,0.38244,0.374],[0.075,0.5372,0.369],[0.64167,0.80208,0.367],[0.15056,0.75149,0.363],[0.36833,0.25446,0.362],[0.86278,0.75744,0.362],[0.53833,0.55804,0.361],[0.15722,0.73958,0.358],[0.60056,0.70387,0.352],[0.90056,0.80804,0.348],[0.725,0.65923,0.347],[0.78056,0.63244,0.345],[0.435,0.73065,0.343],[0.285,0.32887,0.343],[0.38389,0.52827,0.343],[0.80278,0.95685,0.341],[0.63278,0.77232,0.339],[0.84611,0.73363,0.335],[0.05944,0.55208,0.333],[0.23167,0.39732,0.333],[0.14833,0.5878,0.33],[0.71611,0.9747,0.323],[0.82833,0.70685,0.321],[0.54278,0.59375,0.319],[0.13722,0.60565,0.319],[0.64833,0.82589,0.319],[0.74722,0.70387,0.317],[0.30611,0.93601,0.317],[0.725,0.9747,0.314],[0.58722,0.31696,0.313],[0.985,0.89435,0.311],[0.585,0.57589,0.305],[0.185,0.68304,0.301],[0.11611,0.63839,0.298],[0.25056,0.36756,0.297],[0.21167,0.44792,0.297],[0.75944,0.59673,0.297],[0.26389,0.51042,0.296],[0.29944,0.95685,0.295],[0.54611,0.70982,0.293],[0.74056,0.69196,0.291],[0.29389,0.68304,0.286],[0.79056,0.6503,0.285],[0.91389,0.82292,0.284],[0.66056,0.50744,0.284],[0.14611,0.93304,0.281],[0.105,0.65327,0.276],[0.23056,0.94792,0.275],[0.12722,0.62351,0.274],[0.38389,0.54911,0.274],[0.07944,0.32292,0.271],[0.06611,0.70982,0.27],[0.87056,0.76935,0.267],[0.24944,0.69196,0.265],[0.11722,0.95982,0.264],[0.36944,0.95387,0.264],[0.095,0.66815,0.259],[0.81944,0.69494,0.256],[0.19278,0.66815,0.253],[0.21833,0.96875,0.25],[0.79389,0.94792,0.246],[0.37389,0.92113,0.241],[0.49389,0.57589,0.241],[0.60167,0.32887,0.241],[0.265,0.34673,0.238],[0.61722,0.34077,0.232],[0.69278,0.94494,0.232],[0.40611,0.62946,0.231],[0.93944,0.85268,0.231],[0.24389,0.48363,0.225],[0.13944,0.94196,0.223],[0.65833,0.85863,0.223],[0.45944,0.52827,0.22],[0.17056,0.7128,0.22],[0.40833,0.65625,0.219],[0.54389,0.57292,0.216],[0.785,0.93601,0.214],[0.02167,0.76637,0.213],[0.27611,0.3378,0.212],[0.33722,0.61756,0.206],[0.05611,0.9003,0.201],[0.875,0.91815,0.199],[0.60944,0.33482,0.195],[0.37611,0.76339,0.193],[0.23722,0.93304,0.192],[0.69167,0.51935,0.191],[0.49167,0.77232,0.19],[0.91278,0.94792,0.185],[0.215,0.7872,0.184],[0.95722,0.87054,0.176],[0.15389,0.92113,0.174],[0.41611,0.7247,0.174],[0.12722,0.79315,0.173],[0.24944,0.57292,0.171],[0.57944,0.31101,0.169],[0.89278,0.79911,0.169],[0.68722,0.71875,0.161],[0.085,0.68601,0.161],[0.025,0.93006,0.16],[0.625,0.34673,0.16],[0.66278,0.54613,0.15],[0.06833,0.88542,0.142],[0.11056,0.82292,0.14],[0.52056,0.7872,0.137],[0.81167,0.82589,0.136],[0.38167,0.24256,0.133],[0.67722,0.68899,0.133],[0.67833,0.55804,0.133],[0.13278,0.95089,0.132],[0.24389,0.70685,0.131],[0.20833,0.50149,0.127],[0.54611,0.8378,0.125],[0.79722,0.79911,0.124],[0.20611,0.4628,0.123],[0.90167,0.94196,0.121],[0.22833,0.74851,0.121],[0.54167,0.78125,0.121],[0.17833,0.69792,0.118],[0.37278,0.23065,0.117],[0.83833,0.72173,0.115],[0.035,0.92113,0.115],[0.21833,0.56696,0.114],[0.23278,0.3497,0.112],[0.31722,0.88839,0.111],[0.92722,0.8378,0.111],[0.25944,0.87054,0.11],[0.55278,0.68006,0.105],[0.37722,0.89732,0.104],[0.70056,0.95982,0.104],[0.83833,0.86756,0.098],[0.47722,0.79911,0.097],[0.23833,0.72173,0.097],[0.31056,0.91815,0.096],[0.86833,0.90923,0.094],[0.56167,0.94196,0.091],[0.14389,0.76339,0.091],[0.09056,0.85268,0.09],[0.67833,0.9122,0.089],[0.25278,0.89137,0.089],[0.16389,0.7247,0.086],[0.62389,0.95685,0.082],[0.18722,0.13542,0.08],[0.54167,0.61458,0.079],[0.495,0.53125,0.077],[0.13389,0.78423,0.077],[0.54278,0.54018,0.076],[0.87944,0.77827,0.072],[0.55833,0.92113,0.07],[0.38944,0.25446,0.069],[0.65722,0.34375,0.068],[0.225,0.40625,0.067],[0.29611,0.6622,0.067],[0.07722,0.87351,0.067],[0.66944,0.89137,0.066],[0.66056,0.62351,0.065],[0.30389,0.30804,0.062],[0.32167,0.86756,0.062],[0.47167,0.73065,0.056],[0.96833,0.87946,0.051],[0.76833,0.74256,0.049],[0.88389,0.04911,0.047],[0.01278,0.77827,0.047],[0.80944,0.31101,0.046],[0.28278,0.2872,0.045],[0.31056,0.67411,0.043],[0.78611,0.77827,0.038],[0.21056,0.56399,0.037],[0.71611,0.79315,0.037],[0.59611,0.84673,0.035],[0.77167,0.9122,0.035],[0.02944,0.75744,0.033],[0.825,0.8497,0.031],[0.66056,0.56994,0.028],[0.045,0.9122,0.025],[0.16056,0.56994,0.024],[0.24167,0.51042,0.023],[0.84611,0.87946,0.021],[0.50278,0.27827,0.018],[0.66389,0.87649,0.008],[0.64611,0.34375,0.008],[0.075,0.69494,0.007],[0.43722,0.57292,0.005],[0.36278,0.26935,0.002],[0.19167,0.84375,0.001]];

  const wrap = document.createElement('div');
  wrap.className = 'hero-ceiling';
  wrap.setAttribute('aria-hidden', 'true');

  const img = document.createElement('img');
  img.src = 'assets/canopy-ceiling.webp';
  img.alt = '';
  img.width = 1800; img.height = 672;
  img.decoding = 'async';
  img.fetchPriority = 'high';

  // Steps the ceiling back behind the hero copy, which sits over the left of
  // the frame. Inside the layer's own stacking context, so it darkens the
  // photograph without touching the page beneath it.
  const shade = document.createElement('div');
  shade.className = 'hero-ceiling-shade';

  const canvas = document.createElement('canvas');
  canvas.className = 'hero-ceiling-glow';

  wrap.append(img, shade, canvas);
  hero.prepend(wrap);

  const conn = navigator.connection || {};
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches ||
                conn.saveData || /2g/.test(conn.effectiveType || '');

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) { wrap.classList.add('is-live'); return; }

  /* One glow, drawn once into an offscreen tile and then stamped. Three
     hundred and sixty radial gradients a frame is a real cost; three hundred
     and sixty drawImage calls of the same sprite is not. */
  const SPRITE = 64;
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = SPRITE;
  const sctx = sprite.getContext('2d');
  const grad = sctx.createRadialGradient(SPRITE / 2, SPRITE / 2, 0, SPRITE / 2, SPRITE / 2, SPRITE / 2);
  grad.addColorStop(0.00, 'rgba(255,252,242,1)');
  grad.addColorStop(0.12, 'rgba(255,226,170,0.92)');
  grad.addColorStop(0.34, 'rgba(255,175,86,0.38)');
  grad.addColorStop(0.62, 'rgba(226,118,42,0.12)');
  grad.addColorStop(1.00, 'rgba(180,80,20,0)');
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, SPRITE, SPRITE);

  // A fixed phase and rate per bulb: filament bulbs on one long string drift
  // out of step with each other, they do not blink together.
  const phase = new Float32Array(BULBS.length);
  const rate  = new Float32Array(BULBS.length);
  for (let i = 0; i < BULBS.length; i++) {
    const h = Math.sin((i + 1) * 12.9898) * 43758.5453;
    phase[i] = (h - Math.floor(h)) * 6.283;
    rate[i]  = 0.5 + ((h * 7 - Math.floor(h * 7))) * 1.1;
  }

  let w = 0, h = 0, dpr = 1;
  function resize() {
    const rect = img.getBoundingClientRect();
    if (!rect.width) return false;
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = rect.width; h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    return true;
  }

  function draw(t) {
    if (!w) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    // Glows scale with the picture, so a phone gets the same ceiling rather
    // than the same pixel sizes on a much smaller canopy.
    const size = Math.max(14, w * 0.026);
    const half = size / 2;
    for (let i = 0; i < BULBS.length; i++) {
      const b = BULBS[i];
      const flicker = 0.80 + 0.20 * Math.sin(t * rate[i] + phase[i])
                           + 0.05 * Math.sin(t * rate[i] * 3.7 + phase[i] * 2.0);
      ctx.globalAlpha = Math.max(0, Math.min(1, (0.30 + b[2] * 0.55) * flicker));
      const s = size * (0.86 + b[2] * 0.3);
      ctx.drawImage(sprite, b[0] * w - s / 2, b[1] * h - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
  }

  let depth = 0, lean = 0, leanTarget = 0;
  function place() {
    // The ceiling is overhead, so it answers the scroll more slowly than the
    // page does and lifts away rather than sliding with it.
    wrap.style.setProperty('--ceil-y', (-depth * 0.16).toFixed(2) + 'px');
    wrap.style.setProperty('--ceil-x', (lean * 22).toFixed(2) + 'px');
    wrap.style.setProperty('--ceil-scale', (1.04 + Math.abs(lean) * 0.012).toFixed(4));
  }

  function start() {
    if (!resize()) { requestAnimationFrame(start); return; }
    wrap.classList.add('is-live');
    draw(0);
    if (still) return;                      // the ceiling, lit, but holding still

    new ResizeObserver(() => { if (resize()) draw(performance.now() / 1000); }).observe(img);

    addEventListener('scroll', () => { depth = scrollY; }, { passive: true });
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      hero.addEventListener('pointermove', e => {
        const r = hero.getBoundingClientRect();
        leanTarget = ((e.clientX - r.left) / r.width - 0.5) * 2;
      }, { passive: true });
      hero.addEventListener('pointerleave', () => { leanTarget = 0; });
    }

    let visible = true;
    new IntersectionObserver(en => { visible = en[0].isIntersecting; },
      { threshold: 0 }).observe(hero);

    let last = 0;
    (function frame(now) {
      requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      lean += (leanTarget - lean) * 0.06;
      place();
      if (now - last < 33) return;          // the flicker does not need 60fps
      last = now;
      draw(now / 1000);
    })(0);
  }

  if (img.complete) start();
  else { img.addEventListener('load', start, { once: true });
         img.addEventListener('error', () => wrap.remove(), { once: true }); }
})();
