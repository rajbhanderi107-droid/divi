/* The garba circle, in three dimensions.
   The ground at Divi is rings of people turning around a lit centre, adjacent
   rings often moving against each other. That is what this draws: five rings
   of lamps on a floor, counter-rotating, seen from the edge of the ground.
   It replaces nothing — it sits behind the hero copy where the page had only
   texture, and the still mandala stays where it is.

   Loaded only after the page has settled, and never when the visitor has asked
   for less motion or is paying for their bytes. If three.js does not arrive,
   nothing happens and the hero is exactly what it was. */
(() => {
  const hero = document.querySelector('.hero');
  if (!hero || !window.matchMedia) return;
  const conn = navigator.connection || {};
  if (matchMedia('(prefers-reduced-motion: reduce)').matches ||
      conn.saveData || /2g/.test(conn.effectiveType || '')) return;

  const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.149.0/three.min.js';

  function boot() {
    const THREE = window.THREE;
    if (!THREE) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'hero-circle';
    canvas.setAttribute('aria-hidden', 'true');
    hero.prepend(canvas);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    } catch (e) { canvas.remove(); return; }          // no WebGL: leave the hero alone
    renderer.setClearAlpha(0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
    camera.position.set(0, 2.05, 9.2);
    camera.lookAt(0, 0.92, 0);

    // Five rings. Counts rise with radius so spacing between lamps stays even,
    // the way a wider circle simply holds more people.
    const rings = [];
    const COLOURS = [0xffe7b3, 0xf0b567, 0xee9d32, 0xfff0c8, 0xe8873a];
    for (let r = 0; r < 5; r++) {
      const radius = 1.4 + r * 0.78;
      const count = Math.round(radius * 24);
      const pos = new Float32Array(count * 3);
      const seed = new Float32Array(count);
      const tint = new Float32Array(count * 3);
      const c = new THREE.Color();
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        const wobble = (Math.sin(i * 12.9898) * 43758.5453) % 1;
        pos[i * 3]     = Math.cos(a) * (radius + wobble * 0.05);
        pos[i * 3 + 1] = 0.04 + Math.abs(wobble) * 0.10;
        pos[i * 3 + 2] = Math.sin(a) * (radius + wobble * 0.05);
        seed[i] = Math.abs(wobble) * 6.283;
        c.setHex(COLOURS[(i + r) % COLOURS.length]);
        tint[i * 3] = c.r; tint[i * 3 + 1] = c.g; tint[i * 3 + 2] = c.b;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
      g.setAttribute('tint', new THREE.BufferAttribute(tint, 3));

      const m = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uSize: { value: 235 }, uFade: { value: 0 } },
        vertexShader: `
          attribute float seed; attribute vec3 tint;
          uniform float uTime; uniform float uSize;
          varying vec3 vTint; varying float vFlicker;
          void main(){
            vTint = tint;
            vFlicker = 0.72 + 0.28 * sin(uTime * 2.6 + seed * 3.1);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = uSize * vFlicker / -mv.z;
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          uniform float uFade;
          varying vec3 vTint; varying float vFlicker;
          void main(){
            vec2 d = gl_PointCoord - 0.5;
            float r = length(d);
            if (r > 0.5) discard;
            float core = smoothstep(0.5, 0.0, r);
            float halo = pow(core, 1.9);          // the lamp's reach
            float hot  = pow(core, 6.0);          // the flame itself
            vec3 lit = mix(vTint, vec3(1.0, 0.96, 0.88), hot);
            gl_FragColor = vec4(lit * (1.1 + hot * 2.0), (halo * 0.72 + hot * 1.0) * vFlicker * uFade);
          }`
      });
      const points = new THREE.Points(g, m);
      // Adjacent rings turn against each other, as the circles on the ground do.
      points.userData.speed = (r % 2 ? -1 : 1) * (0.055 - r * 0.006);
      scene.add(points);
      rings.push(points);
    }

    // Embers off the lamps: born low near the rings, rising and fading out.
    const EMBERS = 520;
    const ePos = new Float32Array(EMBERS * 3), eSeed = new Float32Array(EMBERS), eLife = new Float32Array(EMBERS);
    for (let i = 0; i < EMBERS; i++) {
      const a = Math.random() * Math.PI * 2, rad = 1.0 + Math.random() * 3.6;
      ePos[i * 3] = Math.cos(a) * rad;
      ePos[i * 3 + 1] = Math.random() * 4.4;
      ePos[i * 3 + 2] = Math.sin(a) * rad;
      eSeed[i] = Math.random() * 6.283;
      eLife[i] = Math.random();
    }
    const eg = new THREE.BufferGeometry();
    eg.setAttribute('position', new THREE.BufferAttribute(ePos, 3));
    eg.setAttribute('seed', new THREE.BufferAttribute(eSeed, 1));
    const em = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uFade: { value: 0 } },
      vertexShader: `
        attribute float seed; uniform float uTime;
        varying float vA;
        void main(){
          vec3 p = position;
          float t = fract(uTime * 0.055 + seed * 0.159);
          p.y = position.y + t * 4.6;                     // rise
          p.x += sin(uTime * 0.6 + seed * 5.0) * 0.16;    // and wander
          p.z += cos(uTime * 0.5 + seed * 4.0) * 0.16;
          vA = (1.0 - t) * (1.0 - t) * 0.85;              // fading as they go
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = (40.0 + 16.0 * sin(seed + uTime * 3.0)) / -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform float uFade; varying float vA;
        void main(){
          vec2 d = gl_PointCoord - 0.5; float r = length(d);
          if (r > 0.5) discard;
          float core = smoothstep(0.5, 0.0, r);
          gl_FragColor = vec4(vec3(1.0, 0.74, 0.4) * (0.85 + core * 1.2), core * core * vA * uFade * 1.3);
        }`
    });
    const embers3d = new THREE.Points(eg, em);
    scene.add(embers3d);

    let w = 0, h = 0;
    const resize = () => {
      const rect = hero.getBoundingClientRect();
      w = Math.max(1, rect.width); h = Math.max(1, rect.height);
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    new ResizeObserver(resize).observe(hero);

    let pointerX = 0, targetX = 0, fade = 0, running = true, last = performance.now();
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    if (fine.matches) {
      hero.addEventListener('pointermove', e => {
        const rect = hero.getBoundingClientRect();
        targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.9;
      }, { passive: true });
      hero.addEventListener('pointerleave', () => { targetX = 0; });
    }

    new IntersectionObserver(en => { running = en[0].isIntersecting; if (running) last = performance.now(); },
      { threshold: 0 }).observe(hero);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) last = performance.now(); });

    let t = 0;
    function frame(now) {
      requestAnimationFrame(frame);
      if (!running || document.hidden) return;
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      t += dt;
      fade = Math.min(1, fade + dt * 0.55);          // rises into view, never a pop
      pointerX += (targetX - pointerX) * Math.min(1, dt * 3);
      camera.position.x = pointerX * 1.5;
      camera.lookAt(0, 0.92, 0);
      for (const ring of rings) {
        ring.rotation.y += ring.userData.speed * dt;
        ring.material.uniforms.uTime.value = t;
        ring.material.uniforms.uFade.value = fade;
      }
      em.uniforms.uTime.value = t;
      em.uniforms.uFade.value = fade;
      embers3d.rotation.y += 0.012 * dt;
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
    canvas.classList.add('is-live');
  }

  const load = () => {
    const s = document.createElement('script');
    s.src = THREE_URL; s.async = true;
    s.onload = boot;
    s.onerror = () => {};                             // hero stays exactly as it was
    document.head.append(s);
  };
  if (document.readyState === 'complete') load();
  else addEventListener('load', load, { once: true });
})();
