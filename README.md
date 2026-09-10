# Divi Garba — Navratri 2026

The event site for Divi Garba, organised by Panchatva Events. Ten nights,
11–20 October 2026, at Master Farm, B/s Sardardham, Vaishnodevi Circle.

Static: plain HTML, CSS and ES modules. No build step, no dependencies.

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

### Ten nights, provisionally

The site runs 11–20 October 2026 — ten nights. Divi has not announced 2026
yet: divigarba.com counts down to 11 October under the words "Nine Nights Of
2026", and NavratriGarba lists 11–19 October. The start date agrees
everywhere; only the length is open, and Divi themselves ran ten nights in
2025 (22 September – 1 October). Ten is a deliberate choice pending the
announcement, not an oversight.

Should it become nine, the length lives in one place — `dates` at the top of
`planner.js` — but the prose does not: the hero, the event strip, the details
section and the FAQ all say ten in words, and the terms repeat the dates.

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
