import { useEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { figures, installations, media, type Media } from "./content";
import { useMediaQuery, useReducedMotion } from "./hooks";
import { BookBack, BookCover, PaperPage } from "./book";
import { MandalaArt, Rosette } from "./mandala-art";
import { Figure } from "./shell";
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
// The album: the Garba film, the reels and the installation photographs as a page-flip book, below the head page.
export function Album() {
  return (
    <section id="album" aria-label="The album" className="relative overflow-hidden px-5 py-20 sm:px-10 sm:py-28">
      <MandalaArt variant="medallion" className="top-1/2 left-1/2 h-[min(130vw,1100px)] w-[min(130vw,1100px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.12]" spin={260} strokeWidth={0.4} />
      <Figure src={figures.garbo} at="top-[8%] -left-[6%] h-[min(74vw,520px)] w-[min(74vw,520px)] opacity-70 sm:left-[2%]" glow={0.19} />
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
