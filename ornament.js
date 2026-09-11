/* Divi's own ornament, put back on the site.

   Divi's posts all share one piece of furniture: a gold hairline flourish set
   above and below the line of Gujarati, a rule running out to each side from a
   small flame at the centre — the diya of દિવી. Every card they publish carries
   it. The site had inherited the palette and the photographs but none of this,
   which is a large part of why it read as a website about Divi rather than as
   Divi's own.

   So the flourish goes above every section heading, on both pages, from one
   place rather than pasted into the markup a dozen times. It is decoration and
   nothing else, so it is hidden from assistive technology entirely. */
(() => {
  const NS = 'http://www.w3.org/2000/svg';

  // The mark itself: a rule out to each side, a pair of diminishing dots, and
  // the flame standing in the middle.
  const FLOURISH =
    '<svg viewBox="0 0 300 26" aria-hidden="true" focusable="false">' +
      '<g class="orn-line">' +
        '<path d="M4 13 H112"/><path d="M188 13 H296"/>' +
        '<circle cx="120" cy="13" r="1.6"/><circle cx="180" cy="13" r="1.6"/>' +
        '<circle cx="131" cy="13" r="1"/><circle cx="169" cy="13" r="1"/>' +
        // the small curls that turn back off each rule
        '<path d="M112 13 q6 -6 12 -3"/><path d="M188 13 q-6 -6 -12 -3"/>' +
      '</g>' +
      // the diya: a flame over its lip
      '<g class="orn-flame">' +
        '<path d="M150 1 c5.2 5.6 6.4 10.2 0 15.6 c-6.4 -5.4 -5.2 -10 0 -15.6 Z"/>' +
        '<path class="orn-lip" d="M142 18 q8 5 16 0"/>' +
      '</g>' +
    '</svg>';

  const make = () => {
    const d = document.createElement('div');
    d.className = 'divi-ornament';
    d.setAttribute('aria-hidden', 'true');
    d.innerHTML = FLOURISH;
    return d;
  };

  /* Section headings only. Not the dialogs — a flourish over "Terms &
     Conditions" would be a joke at Divi's expense — and not the nights rail,
     where ten of them stacked would be wallpaper rather than ornament. */
  const SECTIONS = '.visit-planner, .ritual, .nights, .gallery, .details, .location, .np-cta, .np-hero';
  const marks = [];
  for (const section of document.querySelectorAll(SECTIONS)) {
    const h = section.querySelector('h1, h2');
    if (!h || h.closest('dialog') || h.closest('.night-card, .np-frame')) continue;
    // Above the eyebrow when there is one, so the flourish opens the block.
    const eyebrow = section.querySelector('.eyebrow');
    const anchor = (eyebrow && eyebrow.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING)
      ? eyebrow : h;
    const mark = make();
    anchor.parentNode.insertBefore(mark, anchor);
    marks.push(mark);
  }

  /* Each flourish watches for itself. Hanging the draw-on off the page's own
     reveal classes looked right in the sections that carry them and left the
     mark clipped to nothing — permanently invisible — in the sections that do
     not. An ornament that depends on someone else's class to be visible at all
     is an ornament waiting to disappear. */
  if (!('IntersectionObserver' in window)) {
    for (const m of marks) m.classList.add('is-drawn');
    return;
  }
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-drawn');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -12% 0px' });
  for (const m of marks) io.observe(m);
})();
