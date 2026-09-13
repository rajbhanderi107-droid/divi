(() => {
  const journey = document.querySelector('.chronicle');
  if (!journey) return;
  const root = document.documentElement;
  const scenes = [...journey.querySelectorAll('.journey-scene')];
  const links = [...journey.querySelectorAll('[data-night]')];
  const rail = journey.querySelector('.journey-links');
  const stage = journey.querySelector('.journey-scenes');
  const controls = journey.querySelector('.story-browser-controls');
  const previous = controls.querySelector('[data-story-prev]');
  const next = controls.querySelector('[data-story-next]');
  const status = controls.querySelector('.story-browser-status');
  const progress = journey.querySelector('.journey-progress span');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let current = -1, touch = null;
  const paused = () => root.classList.contains('motion-paused') || (preference.matches && !root.classList.contains('motion-enabled'));
  if (document.body.classList.contains('nights-page')) {
    const toggle = document.querySelector('.motion-toggle');
    let stored = null;
    try { stored = localStorage.getItem('divi-motion'); } catch {}
    let stop = stored ? stored === 'paused' : preference.matches;
    const sync = () => {
      root.classList.toggle('motion-paused', stop);
      root.classList.toggle('motion-enabled', !stop);
      toggle.textContent = stop ? 'Play motion' : 'Pause motion';
      toggle.setAttribute('aria-pressed', String(stop));
      toggle.setAttribute('aria-label', stop ? 'Play animations' : 'Pause animations');
      window.dispatchEvent(new Event('divi:motion'));
    };
    toggle.addEventListener('click', () => { stop = !stop; try { localStorage.setItem('divi-motion', stop ? 'paused' : 'playing'); } catch {} sync(); });
    preference.addEventListener('change', () => { stop = preference.matches; sync(); });
    sync();
  }
  function show(index, writeHash = false, animate = true) {
    index = Math.max(0, Math.min(scenes.length - 1, index));
    if (current === index) return;
    const focusWasInPanel = scenes.some(scene => scene.contains(document.activeElement));
    scenes.forEach((scene, i) => {
      scene.getAnimations({subtree: true}).forEach(animation => animation.cancel());
      scene.hidden = i !== index;
    });
    current = index;
    links.forEach((link, i) => { if (i === index) link.setAttribute('aria-current', 'step'); else link.removeAttribute('aria-current'); });
    previous.disabled = index === 0;
    next.disabled = index === scenes.length - 1;
    status.textContent = `${String(index + 1).padStart(2, '0')} / 10 · ${scenes[index].querySelector('h3').textContent}`;
    progress.style.transform = `scaleX(${(index + 1) / scenes.length})`;
    if (writeHash) history.replaceState(null, '', `#night-${index + 1}`);
    if (focusWasInPanel) links[index].focus({preventScroll: true});
    const target = links[index];
    if (rail.scrollWidth > rail.clientWidth) rail.scrollTo({left: target.offsetLeft - rail.offsetLeft - (rail.clientWidth - target.offsetWidth) / 2, behavior: 'instant'});
    if (animate && !paused()) {
      const scene = scenes[index];
      scene.querySelector('.scene-art').animate([{opacity: .25, transform: 'translateX(18px) scale(1.025)'}, {opacity: 1, transform: 'translateX(0) scale(1)'}], {duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)'});
      scene.querySelector('.scene-copy').animate([{opacity: 0, transform: 'translateY(10px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 460, easing: 'ease-out'});
    }
  }
  journey.classList.add('story-browser');
  controls.hidden = false;
  const hashIndex = () => { const match = /^#night-(10|[1-9])$/.exec(location.hash); return match ? Number(match[1]) - 1 : null; };
  show(hashIndex() ?? 0, false, false);
  links.forEach((link, index) => link.addEventListener('click', event => { event.preventDefault(); show(index, true); }));
  previous.addEventListener('click', () => show(current - 1, true));
  next.addEventListener('click', () => show(current + 1, true));
  rail.addEventListener('keydown', event => {
    const i = links.indexOf(document.activeElement);
    if (i < 0) return;
    const targets = {ArrowRight: Math.min(9, i + 1), ArrowLeft: Math.max(0, i - 1), Home: 0, End: 9};
    if (!(event.key in targets)) return;
    event.preventDefault();
    show(targets[event.key], true);
    links[targets[event.key]].focus({preventScroll: true});
  });
  stage.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch' && !event.target.closest('a,button')) touch = {x: event.clientX, y: event.clientY};
  });
  stage.addEventListener('pointerup', event => {
    if (!touch) return;
    const dx = event.clientX - touch.x, dy = event.clientY - touch.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1), true);
    touch = null;
  });
  stage.addEventListener('pointercancel', () => touch = null);
  window.addEventListener('hashchange', () => { const index = hashIndex(); if (index !== null) show(index); });
  window.addEventListener('divi:motion', () => { if (paused()) stage.getAnimations({subtree: true}).forEach(animation => animation.finish()); });
  // Resolve incoming chapter links before the browser's final anchor scroll.
  window.addEventListener('load', () => {
    if (hashIndex() !== null) journey.scrollIntoView({block: 'start', behavior: 'instant'});
  }, {once: true});
})();
