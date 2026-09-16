Read AGENTS.md and README.md. This is the shared source for Claude Code and Codex. The website is the React + Vite app in web/; edit it there and build with `npm --prefix web run build`. Hosted Claude artifacts do not automatically sync to this repository.

---

# Build notes

Verified against a clean clone + build on 2026-09-15 (Node 24.19.0, npm 11.17.0).
These are the traps that are *not* covered by README.md or AGENTS.md.

## Asset paths use three different conventions — pick by file type

`vite.config.ts` sets `base: "/divi/"`. How you reference an asset depends on
where you are writing, and getting it wrong 404s only on GitHub Pages, never
in `npm run dev`:

| Where | Write | Becomes |
|---|---|---|
| `.tsx` / `.ts` | `a("/assets/x.jpg")` — the helper in `src/site/content.ts` | `/divi/v/assets/x.jpg` |
| `site.css` | `url("/v/fonts/x.woff2")` — root-relative, **no** `/divi` | Vite rebases to `/divi/v/...` at build |
| `index.html` | `/divi/v/assets/x.png` — full path, **with** `/divi` | left as-is |

`a()` is `` `${import.meta.env.BASE_URL}v${path}` ``. Never hardcode `/divi/`
in TS — it breaks the dev server.

## Every photo needs a .webp sibling

Several components derive the WebP path by string replacement rather than
looking it up:

```
p.image.file.replace(/\.jpg$/, ".webp")     // hero.tsx, sections.tsx
image.file.replace(/\.jpe?g$/i, ".webp")    // sections.tsx Picture
```

Adding a `.jpg` to `web/public/v/assets/` without generating the matching
`.webp` yields a broken `<source>` that silently wins in every modern browser.
Add both, or the image disappears.

## Two files named content.ts

- `web/src/site/content.ts` — event details, media paths, `nights`, `scenes`. **This is the one you usually want.**
- `web/src/content.ts` — venue-map data only (route, landmarks), consumed by `components/venue-map.tsx`.

Event facts (dates, venue, phone, gate times) live in the first one and are
referenced as `site.*` everywhere. Change them there, once, not in the JSX.
Note `index.html` carries its own hardcoded copy in the `<title>`, meta
description, and the JSON-LD `Event` block — update those too or the page and
its search-result snippet disagree.

## useReducedMotion() returns false, always

`src/site/hooks.ts` hardcodes it. This is deliberate and is the organiser's
decision (README "Motion and smoothness"). The `reduced` branches throughout
`shell.tsx`, `sections.tsx` and `hero.tsx` are therefore dead code kept as a
fallback. Do not "fix" the hook to read the media query, and do not delete the
branches it guards.

## Z-index is a token scale, not numbers

`site.css` `:root` defines `--z-background: 0` through `--z-loader: 100`
(background · atmosphere · geometry · content · foreground · nav · cursor ·
loader). Components set `style={{ zIndex: "var(--z-content)" }}`. Adding a bare
`z-50` Tailwind class puts the element outside the scale and it will fight the
layers unpredictably.

## Tailwind v4 — no config file

Colors and fonts are the `@theme` block in `src/site/site.css`, not a
`tailwind.config.js` (there isn't one). A new brand colour is a new
`--color-*` line in `@theme`; it then works as `bg-*`, `text-*`, `border-*`.

The palette is obsidian/maroon/temple/sindoor grounds with mukut/antique/gold
and ivory text. The venue map's controls have their own token set in the same
block — leave those alone unless you are working on the map.

## Fonts are unicode-range split

Sregs Serif (display) is deliberately Latin-only. Anek Gujarati carries the
Gujarati range `U+A80-AFF`; digits fall through to Poppins on purpose, matching
the approved design. Widening a `unicode-range` changes the look of text
nobody asked you to touch.

## Commands

```
npm --prefix web install
npm --prefix web run dev      # http://localhost:5173/divi/
npm --prefix web run build    # tsc -b && vite build  ->  web/build  (NOT dist)
npm --prefix web run lint     # oxlint, not eslint
```

A clean build is ~2300 modules in well under a second; output is roughly
490 kB JS / 50 kB CSS before gzip. `build` type-checks first, so a type error
fails the build rather than shipping.

## Deploy

Publish the contents of `web/build` to the `gh-pages` branch. `.nojekyll` is
**not** produced by the build — add it yourself, or GitHub Pages drops
`_`-prefixed files.

`.openai/hosting.json` still points `static.directory` at `dist/`, a directory
removed on 2026-09-15. It is stale; it does not affect the GitHub Pages deploy.

## react-pageflip is loosely typed

`hero.tsx` casts it through a hand-written `FlipApi` type and a
`React.ComponentType<Record<string, unknown>>` shim, with an eslint disable for
`no-explicit-any`. The book calls into `book.current.pageFlip()` at runtime.
Changing the page list means updating `pagesFor()`, which builds a different
sequence for wide vs. narrow viewports and pads to an even page count — pages
render `display: none` until the library takes them over.
