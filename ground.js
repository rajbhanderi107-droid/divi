/* The ground at Master Farm, drawn from above.

   The location section used to be an address, a button and an empty map card.
   This gives it the thing the photographs of Divi actually show: the ground is
   built as a set of rings. A rail at the edge, chairs inside it, the sand the
   garba turns on, the rangoli laid out at the centre, and the altar under the
   canopy in the middle of all of it. Nothing here is invented — every ring is
   something you can see in the pictures further up the page.

   The repeating parts are stamped here rather than written out as several
   hundred SVG elements in the markup: the posts around the rail, the petals of
   the rangoli, and the hem points of the canopy. The turning is CSS. */
(() => {
  const plan = document.querySelector('.ground-plan svg');
  if (!plan) return;
  const NS = 'http://www.w3.org/2000/svg';
  const CX = 210, CY = 210;
  const el = (name, attrs) => {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };

  // The posts holding the rail, evenly spaced the whole way round.
  const posts = plan.querySelector('.gp-posts');
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    posts.append(el('circle', {
      cx: (CX + Math.cos(a) * 196).toFixed(2),
      cy: (CY + Math.sin(a) * 196).toFixed(2),
      r: 2.4
    }));
  }

  /* The rangoli: eight petals of flowers around the altar, which is how it is
     laid at Divi — the same eight-petal figure the photographs show. */
  const rangoli = plan.querySelector('.gp-rangoli');
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    rangoli.append(el('circle', {
      cx: (CX + Math.cos(a) * 44).toFixed(2),
      cy: (CY + Math.sin(a) * 44).toFixed(2),
      r: 21,
      style: '--petal-i:' + i
    }));
  }

  /* The canopy overhead, read from below as the points of its hems stepping
     round the ring — the detail the hero is now hung with. */
  const canopy = plan.querySelector('.gp-canopy');
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2;
    const r = i % 2 ? 76 : 62;
    const x = CX + Math.cos(a) * r, y = CY + Math.sin(a) * r;
    const x2 = CX + Math.cos(a) * (r - 13), y2 = CY + Math.sin(a) * (r - 13);
    canopy.append(el('line', {
      x1: x.toFixed(2), y1: y.toFixed(2), x2: x2.toFixed(2), y2: y2.toFixed(2),
      style: '--hem-i:' + i
    }));
  }
})();
