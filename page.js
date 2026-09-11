/* Shell behaviour for pages that are not the home page: the booking dialog and
   the terms dialog, which live in the header and footer everywhere. app.js is
   not loaded here — it owns the gallery, the lightbox, the hero depth and the
   scroll-spy, none of which exist on this page, and most of its queries would
   throw without them. */
(() => {
  const booking = document.querySelector('#booking');
  const frame = document.querySelector('#booking-frame');
  const url = 'https://sortmyscene.com/widget/embed?eventID=6a981a7a2a894a5381e4911b&dayLabel=General+Admission&festivalLabel=Festival+Pass&hideLogo=false&theme=%23000000';
  const out = document.querySelector('#booking-external');
  if (out) out.href = url;
  if (booking && frame) {
    document.querySelectorAll('[data-book]').forEach(b => b.onclick = () => {
      frame.src = url + '&parentOrigin=' + encodeURIComponent(location.origin);
      booking.showModal();
    });
    booking.addEventListener('close', () => frame.removeAttribute('src'));
  }

  document.querySelectorAll('dialog').forEach(dialog => {
    const close = dialog.querySelector('.close');
    if (close) close.onclick = () => dialog.close();
    dialog.addEventListener('click', e => {
      if (e.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
    });
  });

  const terms = document.querySelector('#terms');
  if (terms) {
    const check = () => {
      if (location.hash === '#terms' && !terms.open) terms.showModal();
      else if (location.hash !== '#terms' && terms.open) terms.close();
    };
    addEventListener('hashchange', check);
    terms.addEventListener('close', () => {
      if (location.hash === '#terms') history.replaceState(null, '', location.pathname + location.search);
    });
    check();
  }

  /* The reading progress bar, which the home page gets from app.js. */
  const bar = document.querySelector('.reading-progress');
  if (bar) {
    let queued = 0;
    const paint = () => {
      queued = 0;
      const range = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (range > 0 ? Math.min(1, Math.max(0, scrollY / range)) : 0) + ')';
    };
    addEventListener('scroll', () => { if (!queued) queued = requestAnimationFrame(paint); }, { passive: true });
    addEventListener('resize', paint);
    paint();
  }
})();
