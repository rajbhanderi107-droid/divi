# Divi Garba — Navratri 2026

The event site for Divi Garba, organised by Panchatva Events. Ten nights,
11–20 October 2026, at Master Farm, B/s Sardardham, Vaishnodevi Circle.

Static: plain HTML, CSS and ES modules. No build step.

One external dependency, and only one: `hero3d.js` pulls three.js 0.149.0 from
cdnjs to draw the garba circle. It is pinned (0.149.0 is the last release
shipping a working UMD build — `three.min.js` in 0.150+ is a deprecation stub,
not the library), fetched only after `load`, and never fetched at all under
`prefers-reduced-motion`, Save-Data or 2G. If it fails to arrive, or the
browser has no WebGL, no canvas is inserted and the hero is exactly what it
was. Nothing else on the page depends on it.

    python3 -m http.server 8000    # then open http://localhost:8000

Deploy by copying the whole folder to any static host.

## Layout

    index.html       Every section: hero, ritual, gallery, planner, details, map.
    style.css        Base type, colour and layout.
    experience.css   Gallery, lightbox, depth effects.
    brand.css        The brown palette and brand marks.
    app.js           Gallery, lightbox, booking dialog, terms, nav, depth.
    planner.js       Night picker, .ics download, sharing, countdown.
    assets/          Logos, mandala, scene photographs, 13 gallery photographs.

## The planner

`planner.js` owns everything under **Plan your visit**:

- The ten night buttons, whose selection is also readable from a `?nights=`
  query parameter, so a shared link reopens someone else's plan.
- **Add to calendar**, which builds a `VCALENDAR` in the browser and hands it
  back as a Blob. One `VEVENT` per selected night, each with a two-hour
  `VALARM`. Lines are folded per RFC 5545 — on octets, not characters, because
  a Gujarati caption is three bytes a letter and a character-count fold can
  still emit an over-length line. Continuation lines begin with a space, which
  counts toward the 75, so they carry 74 octets of content.
- **Share event**, which uses the Web Share sheet where there is one and the
  clipboard otherwise, and falls back to a visible link if both are refused.
  It shares whatever origin the page is served from, so it is correct on a
  staging host as well as in production.
- The countdown to the first beat, which stops ticking while the tab is hidden
  and switches to a "dates have passed" line after the last entry.

Event times are fixed to IST. `DTSTART` is written in UTC (`T143000Z` is
8:00 PM IST); there is deliberately no `DTEND`, because the night has no
published end time.

### Ten nights

The site runs 11-20 October 2026, ten nights, confirmed for this year. That is
not in conflict with divigarba.com counting nine: Navratri's nine nights are
11-19 October, one for each form of Durga, and 20 October is Vijayadashami.
Divi runs all ten.

The length lives in one place — `dates` at the top of `planner.js` — but the
prose does not: the hero, the event strip, the details section, the FAQ and the
nights rail all say ten in words, and the terms repeat the dates.

## The garba circle

`hero3d.js` draws the thing the event actually is: five rings of lamps on a
floor, adjacent rings turning against each other the way the circles on the
ground do, seen from the edge. It sits behind the hero copy where the page had
only texture; the photograph, the video and the still mandala are untouched.

Two things were learned making it read at all:

- **Additive blending needs something to add to.** On the hero's bright
  terracotta the lamps were invisible. The `.hero::before` shadow is not
  decoration — it is what the light lands on, and it is also true to the
  subject, since a garba ground at night is dark and lit by its own lamps.
- **Ring radius is bounded by the field of view.** At 42° and z≈9, anything
  past a radius of about 3.8 puts the camera inside the rings, and the circle
  reads as scattered sparks rather than as a circle.

It pauses off-screen and on a hidden tab, caps device pixel ratio at 1.5, and
fades in on its own first frame so nothing pops.

## The backdrop

`backdrop.js` drifts the nine forms behind the page at low opacity: each panel
on its own slow course, pulled by scroll and pushed away from the pointer. It
is Canvas 2D rather than a second WebGL context — nine `drawImage` calls a
frame cost nothing and need no library.

It reads through the sections whose grounds are translucent (`.ritual` at 8%
and `.location` at 25%) and is covered by the ones that paint themselves
opaque. That is the intent: presence where the page is plain, nothing where it
already has something to say.

Three things this got wrong first, all worth keeping in mind before touching it:

- **`globalCompositeOperation` blends within the canvas**, whose pixels start
  transparent, so `overlay` there composites against nothing. Blending with the
  *page* is `mix-blend-mode` on the element. The canvas draws plainly.
- **JavaScript `%` is a remainder, not a modulo.** The scroll wrap went
  negative once `scroll * depth` passed the offset, and panels flew off the top
  rather than round to the bottom. This is why it appeared not to work at all,
  even at full opacity.
- **A hard rectangle reads as a pasted image.** Each panel is feathered once on
  load through a radial `destination-in` mask, so it reads as a watermark in
  the ground.

Strength is two dials: `globalAlpha` in the draw loop and `opacity` on
`.page-backdrop`. Under `prefers-reduced-motion` it renders a single static
frame — still visible, but it does not move.

## The nine nights

`#nights` tells the story: Navratri is nine nights, each belonging to a form of
Durga, and Divi keeps all nine then adds a tenth for Dussehra. That is why the
site can run ten nights while divigarba.com says nine — nights 1–9 are
11–19 October, and 20 October is Vijayadashami.

The nine forms run in **traditional order**, which is Skandamata fifth and
Katyayani sixth. The source artwork numbered those two the other way round;
the images are paired with the deity each one depicts, not with the number it
carried in the sheet, because worshippers read the order and would notice.

The rail carries the same controls as the gallery, from one `wireRail` in
`app.js` rather than a second copy of the stepping and end-disabling logic.
Its frames are articles, not buttons, so the rail itself takes focus and the
browser's own arrow keys scroll it — that is what the `tabindex` and group
role are for, and without them a scrollable region is unreachable by keyboard.

Each frame is a gateway — the hero's arch and its inset keyline at frame scale.
The keyline cannot take `border-radius: inherit`: a percentage radius
re-resolves against the smaller inset box and the arc comes out flatter than
the frame's, which reads as a line drawn across the art. Its percentages are
the frame's scaled by the inset, so the two arcs stay concentric at every card
width.

The tenth frame has no Navadurga and does not borrow one — there is no tenth
form to show. It is an open, lit gateway, and deliberately the brightest frame
in the rail: Dussehra is the night the other nine build toward, not a footnote
to them.

Source art was supplied as a 512×279 contact sheet, so each panel is 167×70
native. They are sharpened, veiled 22% toward terracotta and grained to sit
with the photography, and shown near their native size for that reason. Higher
resolution originals would drop straight in at the same filenames.

## The gallery

`app.js` holds the photographs in one array of `[file, title]` pairs, and
`photoPath` picks the extension. To add a photograph, drop the file in
`assets/` and add a pair — the card, the lightbox entry, the numbering,
the keyboard order and the neighbour preloading all follow from that list.

## Images

Every raster asset is WebP, sized to how it is actually used rather than to
what came out of the camera: the planner background sits under a near-opaque
gradient, so it is compressed hard; the organiser's logo renders at 122px and
was shipped at 4140px wide. The whole set is 2.8 MB on disk, and a first load
pulls about 164 KB because everything below the fold is lazy.

`favicon.png` stays a PNG on purpose — Safari does not reliably take a WebP
icon.

To replace a photograph, drop it in and match the existing long edge (1400px
for gallery photographs, 1600–1800px for the scene images).

## Head

The `<head>` carries Open Graph and Twitter card tags and a schema.org
`Festival` with one `subEvent` per night, so the ten nights are legible to
search engines rather than only to a reader.

**Three absolute URLs hardcode the origin** — `canonical`, `og:url` and
`og:image`/`twitter:image`. Social crawlers cannot resolve relative paths, so
these must change when the site moves; an HTML comment marks them. There is no
`offers` block, because ticket prices are the ticket provider's and are not
known here; add one when they are, or the event will not qualify for rich
results.

## Booking

Passes are sold through SortMyScene, embedded in a dialog and also linked out
for anyone whose browser blocks the frame. The planner never claims to reserve
entry, and says so beneath the buttons.
