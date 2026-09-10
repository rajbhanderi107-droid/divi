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

## The gallery

`app.js` holds the photographs in one array of `[file, title]` pairs, and
`photoPath` picks the extension. To add a photograph, drop the file in
`assets/` and add a pair — the card, the lightbox entry, the numbering,
the keyboard order and the neighbour preloading all follow from that list.

## Booking

Passes are sold through SortMyScene, embedded in a dialog and also linked out
for anyone whose browser blocks the frame. The planner never claims to reserve
entry, and says so beneath the buttons.
