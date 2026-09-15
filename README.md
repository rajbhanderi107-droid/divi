# Divi Garba
Website for Divi Garba 2026 (11 — 20 October, Master Farm, B/s Sardardham, Vaishnodevi Circle, Ahmedabad), shared by Claude Code and Codex. Both tools should open this same repository.

Live site: https://rajbhanderi107-droid.github.io/divi/

## Run
Node 22 or newer.
```
cd web
npm install
npm run dev        # http://localhost:5173/divi/
npm run build      # type-checks and builds to web/build
npx vite preview --port 5198
```

## Structure
The design follows the approved https://divigarba.vercel.app (the Divi team asked to build on it rather than replace it).

- `web/src/site/`
  - `shell.tsx`: loader, warm atmosphere and embers, cursor, grain, header, footer.
  - `hero.tsx`: the head page and the album.
    - Head page: Mataji's painting as a soft portrait with gold mandalas turning behind her (her face kept clear), a breathing glow, the Gujarati title, Book ticket, Get directions and the event facts.
    - Album: the page-flip book of the Garba film, reels and installation photographs on paper pages. It only turns pages and plays films while on screen.
  - `book.tsx`: the album covers and paper pages.
  - `sections.tsx`: the ritual cross-fade, the nights marquee and lightbox, the date card and Location with the 3D map.
  - `mandala-art.tsx`, `mandala.tsx`: gold mandala line art and the Divi mandala image, all turning in a loop.
  - `legal.tsx`: `#terms`, `#privacy-choices`.
  - `content.ts`: event settings and media paths.
  - `site.css`: tokens, fonts, carved frames.
- `web/src/components/venue-map.tsx`: MapLibre 3D map of Master Farm with the route from Vaishnodevi Circle, built when its section comes near.
- `web/src/content.ts`, `web/src/lib/`: venue map data, route and motion context used by the map.
- Media: `web/public/v/` (served at `/divi/v/`); the share image is `web/public/assets/og-divi.jpg`.
- Booking: SortMyScene `embed.js` on `#buy-btn` (the hero's Book ticket clicks it).

## Motion and smoothness
- Animations and every mandala loop run on all devices, whatever the system reduce-motion setting says. There is no pause switch.
- Off screen, mandalas are hidden so the browser skips drawing them, but their spin keeps running.
- On phones the grain overlay and the scroll-drifting background are skipped. The hero glow animates opacity only.

## Deploy
Build, then publish the contents of `web/build` (plus `.nojekyll`) to the `gh-pages` branch, which GitHub Pages serves at `/divi/`.

## History
The earlier versions (the framework-free site in `dist/` with its films, the Blender 3D world fly-through and the scripts that rendered it) were removed on 2026-09-15 at the owner's request. They remain in git history before that commit.
