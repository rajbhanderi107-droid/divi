import { useEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { Calendar, MapPin, Music } from "lucide-react";
import { installations, media, site, type Media } from "./content";
import { gsap, useGSAP, useMediaQuery, useReducedMotion } from "./hooks";
import { BookBack, BookCover, PaperPage } from "./book";
import { MandalaArt, Rosette } from "./mandala-art";

type Page =
  | { kind: "cover" }
  | { kind: "film"; half: 0 | 1; whole?: boolean }
  | { kind: "reel"; src: Media }
  | { kind: "photo"; image: Media }
  | { kind: "blank" }
  | { kind: "back" };

const FLIP_EVERY = 3800;
// The first automatic turn waits until the page has settled (each turn repositions pages with left/top).
const FIRST_FLIP = 7000;
// Pages stay hidden until the page-flip library takes them over; otherwise they render stacked for a moment and jump.
const HIDDEN_UNTIL_INIT = { display: "none" } as const;

function pagesFor(wide: boolean): Page[] {
  const pages: Page[] = [{ kind: "cover" }];
  if (wide) pages.push({ kind: "film", half: 0 }, { kind: "film", half: 1 });
  else pages.push({ kind: "film", half: 0, whole: true });
  pages.push({ kind: "reel", src: media.reelOne }, { kind: "photo", image: installations[0] }, { kind: "reel", src: media.reelTwo }, { kind: "photo", image: installations[1] });
  for (const image of installations.slice(2)) pages.push({ kind: "photo", image });
  if (wide && (pages.length - 1) % 2 === 1) pages.push({ kind: "blank" });
  pages.push({ kind: "back" });
  return pages;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type FlipApi = { flipNext: () => void; flipPrev: () => void; turnToPage: (n: number) => void; getCurrentPageIndex: () => number; getPageCount: () => number; getState: () => string; update?: () => void };
const FlipBook = HTMLFlipBook as unknown as React.ComponentType<Record<string, unknown> & { ref?: React.Ref<any>; children?: React.ReactNode }>;

// The hero's page-flip book: the cover, the Garba film across a spread, two reels and the installation photographs.
// It turns on its own every few seconds, pauses while hovered or while a film plays, and turns when a film ends.
function Flipbook() {
  const book = useRef<any>(null);
  const [page, setPage] = useState(0);
  const [hovering, setHovering] = useState(false);
  const reduced = useReducedMotion();
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const wide = useMediaQuery("(min-width: 600px)");
  const pages = useMemo(() => pagesFor(wide), [wide]);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const videoPages = useMemo(() => {
    const map = new Map<number, string>();
    pages.forEach((p, i) => {
      if (p.kind === "film" && p.half === 0) map.set(i, "film");
      if (p.kind === "reel") map.set(i, "reel");
    });
    return map;
  }, [pages]);
  const active = videoPages.has(page) ? page : null;
  const [running, setRunning] = useState(false);
  const busy = active !== null && running;
  const [mutedFallback, setMutedFallback] = useState(false);
  const api = (): FlipApi | undefined => book.current?.pageFlip?.();
  const frame = useRef<HTMLDivElement>(null);

  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    const el = frame.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!onScreen) for (const v of videos.current) v?.pause();
  }, [onScreen]);

  const syncHalves = () => {
    const [first, second] = videos.current;
    if (first && second && Math.abs(second.currentTime - first.currentTime) > 0.08) second.currentTime = first.currentTime;
  };

  useEffect(() => {
    if (!mutedFallback) return;
    const unmute = () => setMutedFallback(false);
    document.addEventListener("pointerdown", unmute, { once: true });
    document.addEventListener("keydown", unmute, { once: true });
    return () => {
      document.removeEventListener("pointerdown", unmute);
      document.removeEventListener("keydown", unmute);
    };
  }, [mutedFallback]);

  useEffect(() => {
    const all = videos.current.filter(Boolean) as HTMLVideoElement[];
    if (!all.length) return;
    for (const v of all) if (v.dataset.index !== String(active)) v.pause();
    if (active === null || !onScreen) return;
    let alive = true;
    const group = all.filter((v) => v.dataset.index === String(active));
    for (const v of group) v.currentTime = 0;
    const [lead, ...rest] = group;
    const start = (): void => {
      lead
        ?.play()
        .then(() => alive && setRunning(true))
        .catch(() => {
          if (!alive) return;
          if (!lead.muted) {
            lead.muted = true;
            setMutedFallback(true);
            start();
            return;
          }
          setRunning(false);
        });
    };
    start();
    for (const v of rest) v.play().catch(() => {});
    return () => {
      alive = false;
    };
  }, [active, onScreen]);

  useEffect(() => {
    const el = frame.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let raf = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => api()?.update?.());
    });
    observer.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  const turn = (dir: number) => {
    const flip = api();
    if (flip) (dir < 0 ? flip.flipPrev() : flip.flipNext());
  };
  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const flip = api();
    if (!flip || flip.getState() !== "read") return;
    const r = e.currentTarget.getBoundingClientRect();
    turn(e.clientX - r.left < r.width / 2 ? -1 : 1);
  };
  const onEnded = () => {
    setRunning(false);
    if (!reduced && !hovering) turn(1);
  };

  const firstRun = useRef(true);
  useEffect(() => {
    if (reduced || hovering || busy || !onScreen) return;
    const tick = () => {
      const flip = api();
      if (!flip) return;
      if (flip.getCurrentPageIndex() >= flip.getPageCount() - 1) flip.turnToPage(0);
      else flip.flipNext();
    };
    let timer = 0;
    const delay = window.setTimeout(() => {
      firstRun.current = false;
      tick();
      timer = window.setInterval(tick, FLIP_EVERY);
    }, firstRun.current ? FIRST_FLIP : FLIP_EVERY);
    return () => {
      clearTimeout(delay);
      clearInterval(timer);
    };
  }, [reduced, hovering, busy, onScreen]);

  const last = pages.length - 1;
  return (
    <div className="mx-auto flex w-full max-w-[min(90vh,700px)] flex-col pb-8 sm:pb-3 lg:max-w-[calc(150vh-320px)]" onPointerEnter={finePointer ? () => setHovering(true) : undefined} onPointerLeave={finePointer ? () => setHovering(false) : undefined}>
      {/* Size containment keeps the frame at its aspect ratio while the page-flip library measures and lays out its pages
          (without it the frame briefly grows and shifts the hero). */}
      <div ref={frame} onClick={onClick} className="aspect-3/4 w-full shrink-0 cursor-pointer [contain:size] min-[600px]:aspect-3/2">
        <FlipBook
          ref={book}
          width={900}
          height={1200}
          size="stretch"
          minWidth={280}
          maxWidth={900}
          minHeight={373}
          maxHeight={1200}
          maxShadowOpacity={0.5}
          showCover
          mobileScrollSupport
          useMouseEvents
          startPage={0}
          drawShadow
          flippingTime={1000}
          usePortrait
          startZIndex={0}
          autoSize
          clickEventForward
          swipeDistance={30}
          showPageCorners
          disableFlipByClick={false}
          style={{}}
          onFlip={(e: { data: number }) => setPage(e.data)}
          className={`mx-auto transition-transform duration-500 ease-out ${page === 0 ? "lg:-translate-x-1/4" : page >= last ? "lg:translate-x-1/4" : ""}`}
        >
          {pages.map((p, i) => {
            if (p.kind === "cover")
              return (
                <div key="cover" data-density="hard" className="overflow-hidden bg-maroon" style={HIDDEN_UNTIL_INIT}>
                  <BookCover />
                </div>
              );
            if (p.kind === "back")
              return (
                <div key="back" data-density="hard" className="overflow-hidden bg-maroon" style={HIDDEN_UNTIL_INIT}>
                  <BookBack />
                </div>
              );
            if (p.kind === "blank")
              return (
                <div key="blank" aria-hidden style={HIDDEN_UNTIL_INIT}>
                  <PaperPage />
                </div>
              );
            if (p.kind === "film") {
              const second = p.half === 1;
              return (
                <div key={`film-${p.half}`} className="relative overflow-hidden bg-obsidian" style={HIDDEN_UNTIL_INIT}>
                  <video
                    ref={(el) => {
                      videos.current[p.half] = el;
                      if (el) el.dataset.index = String(p.whole || !second ? i : i - 1);
                    }}
                    src={media.video.file}
                    poster={media.video.poster}
                    aria-label={media.video.alt}
                    muted
                    playsInline
                    preload="none"
                    onTimeUpdate={second ? undefined : syncHalves}
                    onEnded={second ? undefined : onEnded}
                    className={`absolute top-0 left-0 h-full w-full max-w-none object-cover ${p.whole ? "" : "min-[600px]:w-[200%]"} ${second ? "min-[600px]:-left-full" : ""}`}
                  />
                </div>
              );
            }
            if (p.kind === "reel")
              return (
                <div key={p.src.file} className="relative overflow-hidden" style={HIDDEN_UNTIL_INIT}>
                  <PaperPage>
                  <video
                    ref={(el) => {
                      videos.current[i] = el;
                      if (el) el.dataset.index = String(i);
                    }}
                    src={p.src.file}
                    poster={p.src.poster}
                    aria-label={p.src.alt}
                    muted={mutedFallback}
                    playsInline
                    preload="none"
                    onEnded={onEnded}
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition: "center top" }}
                  />
                  </PaperPage>
                </div>
              );
            return (
              <div key={p.image.file} className="overflow-hidden" style={HIDDEN_UNTIL_INIT}>
                <PaperPage>
                  <picture className="contents">
                    <source srcSet={p.image.file.replace(/\.jpg$/, ".webp")} type="image/webp" />
                    {/* The next few pages load ahead so a turn never lands on an empty page. */}
                    <img src={p.image.file} alt={p.image.alt} loading={i <= page + 4 ? "eager" : "lazy"} decoding="async" className="h-full w-full object-cover" />
                  </picture>
                </PaperPage>
              </div>
            );
          })}
        </FlipBook>
      </div>
    </div>
  );
}

const facts = [
  { Icon: Calendar, head: "11 — 20 Oct 2026", sub: "Ten nights" },
  { Icon: MapPin, head: site.venueName, sub: "Vaishnodevi Circle" },
  { Icon: Music, head: "Shehnai · dhol", sub: `From ${site.gateEntry} · Last entry ${site.entryCloses}` },
];
const vectors = [
  { at: "bottom-[-14%] right-[-16%] w-[min(78vw,560px)]", spin: 150, drift: 18 },
  { at: "top-[-12%] right-[18%] hidden w-[min(64vw,420px)] lg:block", spin: -190, drift: -22 },
];
const bells = [{ at: "right-[6%] sm:right-[12%]", size: "w-[min(26vw,150px)] lg:w-[min(16vw,210px)]", flip: true, sway: -1.9, period: 5.1 }];

// The portrait keeps Mataji's face clear: it fades out in a soft oval around her, and the mandalas turn behind it.
const PORTRAIT_MASK = "radial-gradient(ellipse 72% 64% at 28% 47%, #000 74%, rgba(0,0,0,0.55) 88%, transparent 100%)";
// The section's own extra tint eases off toward the bottom so the head page flows into the next section without
// a hard edge, but keeps a small residual (rather than fading to nothing) so Mataji's corner still reads as its
// own lit space against the rest of the page, one shade apart rather than identical.
const BOTTOM_FADE = "linear-gradient(180deg, #000 72%, rgba(0,0,0,0.45) 100%)";

// The head page: Mataji's painting as a glowing portrait with gold mandalas turning behind her, and the event beside it.
export function Hero({ start = true }: { start?: boolean }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      gsap.set(q("[data-rise]"), { y: 34, opacity: 0 });
      gsap.set(q("[data-mataji]"), { opacity: 0, scale: 1.06 });
      gsap.set(q("[data-halo]"), { opacity: 0, scale: 0.8, rotation: -50 });
      if (start)
        gsap
          .timeline()
          .to(q("[data-mataji]"), { opacity: 1, scale: 1, duration: 2.2, ease: "power2.out" })
          .to(q("[data-halo]"), { opacity: 1, scale: 1, rotation: 0, duration: 2.6, ease: "power3.out" }, 0.15)
          .to(q("[data-rise]"), { y: 0, opacity: 1, duration: 1.1, ease: "power3.out", stagger: 0.09 }, 0.45);
      // A diya-like warmth breathes over her face.
      gsap.to(q("[data-glow]"), { opacity: 0.9, duration: 3.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(q("[data-cue]"), { yPercent: 260, duration: 1.8, repeat: -1, ease: "power2.inOut" });
      // Scrolling away, the portrait sinks slower than the page and the words lift off.
      gsap.to(q("[data-portrait]"), { yPercent: 14, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
      gsap.to(q("[data-copy]"), { y: -60, opacity: 0.2, ease: "none", scrollTrigger: { trigger: root.current, start: "30% top", end: "bottom top", scrub: true } });
      q("[data-bell]").forEach((el, i) => {
        const { sway, period, flip } = bells[i];
        gsap.set(el, { scaleX: flip ? -1 : 1 });
        gsap.fromTo(el, { rotation: -sway }, { rotation: sway, duration: period, repeat: -1, yoyo: true, ease: "sine.inOut" });
      });
      q("[data-vector]").forEach((el, i) => {
        const { spin, drift } = vectors[i];
        gsap.to(el, { rotation: spin > 0 ? 360 : -360, duration: Math.abs(spin), repeat: -1, ease: "none" });
        gsap.to(el, { y: drift, duration: Math.abs(spin) / 4, repeat: -1, yoyo: true, ease: "sine.inOut" });
      });
    },
    { scope: root, dependencies: [start] },
  );

  return (
    <section ref={root} id="home" className="relative isolate flex min-h-svh w-full overflow-hidden" aria-label={`${site.name} — Navratri 2026`}>
      {/* No picture of its own: the hero sits on the same fixed Atmosphere photo as every other section, so the
          ground never jumps to a differently-cropped copy at the boundary below. Only the extra tint is local. */}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,5,4,0.25)_0%,rgba(7,5,4,0.35)_45%,rgba(7,5,4,0.85)_100%)] lg:bg-[linear-gradient(90deg,rgba(7,5,4,0.15)_0%,rgba(7,5,4,0.3)_45%,rgba(7,5,4,0.78)_100%)]" style={{ zIndex: "var(--z-atmosphere)", maskImage: BOTTOM_FADE, WebkitMaskImage: BOTTOM_FADE }} />
      {vectors.map(({ at }) => (
        <picture key={at} className="contents">
          <source srcSet={media.vector.webp} type="image/webp" />
          <img data-vector src={media.vector.file} alt="" aria-hidden loading="lazy" decoding="async" className={`pointer-events-none absolute opacity-30 ${at}`} style={{ zIndex: "var(--z-geometry)", maskImage: "linear-gradient(180deg, #000 30%, transparent 70%)", WebkitMaskImage: "linear-gradient(180deg, #000 30%, transparent 70%)" }} />
        </picture>
      ))}
      {bells.map(({ at, size }) => (
        <picture key={at} className="contents">
          <source srcSet={media.bell.webp} type="image/webp" />
          <img data-bell src={media.bell.file} alt="" aria-hidden decoding="async" className={`pointer-events-none absolute top-0 hidden origin-top opacity-55 min-[1300px]:block ${size} ${at}`} style={{ zIndex: "var(--z-geometry)" }} />
        </picture>
      ))}

      {/* Mataji: a 3:4 portrait anchored to the left edge (full height on desktop, full width on phones). */}
      <div data-portrait className="pointer-events-none absolute top-0 left-0 aspect-3/4 w-full max-lg:max-h-[82svh] lg:h-full lg:w-auto" style={{ zIndex: "var(--z-geometry)" }}>
        <div className="absolute top-[46%] left-[27%] aspect-square w-[168%] -translate-x-1/2 -translate-y-1/2">
          <div data-halo className="relative h-full w-full opacity-0">
            <MandalaArt className="inset-0 opacity-60" spin={140} strokeWidth={0.32} />
            <MandalaArt variant="chakra" className="inset-[19%] opacity-70" spin={95} reverse strokeWidth={0.42} />
          </div>
        </div>
        <div data-mataji className="absolute inset-0 opacity-0" style={{ maskImage: PORTRAIT_MASK, WebkitMaskImage: PORTRAIT_MASK }}>
          {/* A quiet, silent loop of Mataji crowned with the mukut — the poster is the first frame, so the video
              never causes a flash or layout shift once it can play. */}
          <video src={media.mataji.file} poster={media.mataji.poster} aria-label={media.mataji.alt} autoPlay muted loop playsInline preload="auto" width={900} height={1200} className="h-full w-full object-cover" />
          <div data-glow className="absolute top-[47%] left-[25%] h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 will-change-[opacity]" style={{ background: "radial-gradient(closest-side, rgba(255,196,92,0.30), rgba(240,160,60,0.10) 62%, transparent)" }} />
        </div>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 top-[min(82vw,62svh)] bg-[linear-gradient(180deg,transparent_0%,rgba(14,7,3,0.78)_22%,rgba(14,7,3,0.86)_74%,transparent_100%)] lg:hidden" style={{ zIndex: "var(--z-geometry)" }} />
      <div className="relative mx-auto flex w-full max-w-416 px-5 pt-[min(96vw,74svh)] pb-16 sm:px-10 lg:items-center lg:justify-end lg:pt-28 lg:pb-20" style={{ zIndex: "var(--z-content)" }}>
        <div data-copy className="w-full lg:w-[min(46vw,640px)]">
          <p data-rise className="label text-antique">Navratri 2026 · Ahmedabad</p>
          <h1 data-rise lang="gu" className="mt-3 font-ui text-[clamp(2.6rem,6.2vw,6rem)] leading-[1.25] text-ivory [text-shadow:0_4px_30px_rgba(0,0,0,0.55)]">
            સાંજથી પરોઢ
          </h1>
          <p data-rise className="display-type mt-3 text-[clamp(1.2rem,2vw,1.8rem)] text-mukut italic">Ten nights. One circle.</p>
          <p data-rise className="mt-4 max-w-[46ch] text-[clamp(0.98rem,1.1vw,1.15rem)] leading-[1.7] font-light text-ivory/70">
            Garba, dhol, devotion and togetherness — ten nights of music, movement and celebration, all coming together in one timeless circle.
          </p>
          <div data-rise className="mt-7 flex flex-wrap items-center gap-3">
            <button type="button" data-cursor="cta" onClick={() => document.getElementById("buy-btn")?.click()} className="cta-label min-h-12 cursor-pointer rounded-full border border-mukut bg-mukut px-7 py-3 text-obsidian shadow-[0_10px_40px_-10px_rgba(240,193,75,0.6)] transition-colors duration-500 hover:border-gold hover:bg-gold">
              Book ticket
            </button>
            <a href={site.maps} target="_blank" rel="noopener noreferrer" className="cta-label inline-flex min-h-12 items-center rounded-full border border-antique/50 px-7 py-3 text-ivory transition-colors duration-500 hover:border-mukut hover:text-mukut">
              Get directions
            </a>
          </div>
          <div data-rise className="divider-carved mt-9">
            <Rosette />
          </div>
          <ul data-rise className="mt-6 grid grid-cols-1 gap-y-4 sm:grid-cols-3 sm:gap-y-0 sm:divide-x sm:divide-antique/20">
            {facts.map(({ Icon, head, sub }) => (
              <li key={head} className="flex items-start gap-3 sm:block sm:px-4 sm:first:pl-0 sm:last:pr-0">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-mukut sm:mb-2 sm:h-6 sm:w-6" aria-hidden strokeWidth={1.6} />
                <div>
                  <p className="text-[clamp(1rem,1.3vw,1.35rem)] leading-tight text-balance text-ivory">{head}</p>
                  <p className="mt-1 text-[clamp(0.72rem,0.85vw,0.9rem)] tracking-[0.12em] text-ivory/60 uppercase">{sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <a href="#album" aria-label="Scroll down" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-ivory/60 lg:flex" style={{ zIndex: "var(--z-content)" }}>
        <span className="label">Scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-antique/25">
          <span data-cue className="absolute top-[-40%] left-0 h-[40%] w-px bg-mukut" />
        </span>
      </a>
    </section>
  );
}

// The album: the Garba film, the reels and the installation photographs as a page-flip book, below the head page.
export function Album() {
  return (
    <section id="album" aria-label="The album" className="relative overflow-x-clip px-5 py-16 sm:px-10 sm:py-24">
      <MandalaArt variant="medallion" className="top-1/2 left-1/2 h-[min(130vw,1100px)] w-[min(130vw,1100px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.12]" spin={260} strokeWidth={0.4} />
      <div className="relative mx-auto max-w-6xl" style={{ zIndex: "var(--z-content)" }}>
        <div className="mb-10 text-center">
          <span className="label text-antique">The album</span>
          <h2 className="display-type mt-2 text-[clamp(1.6rem,3.4vw,2.4rem)] text-ivory">Relive the nights.</h2>
          <div className="divider-carved mt-4">
            <Rosette />
          </div>
        </div>
        <div className="book-shell">
          <Flipbook />
        </div>
      </div>
    </section>
  );
}
