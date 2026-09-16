import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { nights, site, type Shot } from "./content";
import { gsap, useGSAP, useReducedMotion } from "./hooks";
import { Mandala } from "./mandala";
import { MandalaArt, Rosette } from "./mandala-art";
import { Backdrop } from "./shell";
import { lockScroll } from "@/lib/scroll";
import { VenueMap } from "@/components/venue-map";
import { venueMap } from "@/content";

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(" ");

// ---------------------------------------------------------------- the nights: a slow marquee of photographs with a lightbox

function Picture({ image, priority = false, className }: { image: Shot; priority?: boolean; className?: string }) {
  const webp = image.file.replace(/\.jpe?g$/i, ".webp");
  return (
    <picture className="contents">
      {webp !== image.file && <source srcSet={webp} type="image/webp" />}
      <img src={image.file} alt={image.alt} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" className={cx("h-full w-full object-cover", className)} style={{ objectPosition: image.focal || "center" }} />
    </picture>
  );
}

function Lightbox({ shot, onClose }: { shot: Shot; onClose: () => void }) {
  const figure = useRef<HTMLElement>(null);
  const scrim = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close.current();
    document.addEventListener("keydown", onKey);
    lockScroll(true);
    document.body.classList.add("lightbox-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      lockScroll(false);
      document.body.classList.remove("lightbox-open");
    };
  }, []);
  useGSAP(
    () => {
      if (reduced) {
        gsap.set([scrim.current, figure.current], { opacity: 1, rotateY: 0, scale: 1 });
        return;
      }
      gsap
        .timeline()
        .fromTo(scrim.current, { opacity: 0 }, { opacity: 1, duration: 0.28, ease: "power2.out" }, 0)
        .fromTo(figure.current, { rotateY: -94, scale: 0.62, opacity: 0 }, { rotateY: 0, scale: 1, opacity: 1, duration: 0.62, ease: "power3.out" }, 0.04);
    },
    { dependencies: [shot.file] },
  );
  return createPortal(
    <div className="fixed inset-0 grid place-items-center p-5 sm:p-10" style={{ zIndex: "var(--z-loader)", perspective: "1600px" }} role="dialog" aria-modal="true" aria-label={shot.title}>
      <button ref={scrim} type="button" onClick={onClose} aria-label="Close" className="absolute inset-0 cursor-zoom-out bg-obsidian/92 backdrop-blur-sm" />
      <figure ref={figure} className="frame-ancient frame-pips relative flex max-h-[86svh] w-[min(92vw,760px)] flex-col bg-maroon will-change-transform" style={{ transformStyle: "preserve-3d" }}>
        <div className="relative aspect-3/4 max-h-[74svh] min-h-0 w-full shrink overflow-hidden sm:aspect-4/3">
          <Picture image={shot} priority />
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(53,10,8,0.22), transparent 42%, rgba(7,5,4,0.78))" }} />
          <span className="display-type absolute top-5 left-6 text-[clamp(2rem,4vw,3rem)] leading-none text-mukut">{shot.n}</span>
        </div>
        <figcaption className="shrink-0 px-6 pt-4 pb-5">
          <h3 className="display-type text-2xl text-ivory">{shot.title}</h3>
          {shot.line && <p className="mt-1 text-sm text-ivory/60">{shot.line}</p>}
        </figcaption>
      </figure>
      <button type="button" onClick={onClose} className="label absolute top-6 right-6 cursor-pointer rounded-full border border-antique/40 bg-obsidian/80 px-4 py-2 text-mukut transition-colors hover:bg-mukut hover:text-obsidian" style={{ zIndex: 3 }}>
        Close
      </button>
    </div>,
    document.body,
  );
}

export function Gallery() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState<Shot | null>(null);
  const [radius, setRadius] = useState(260);
  const reduced = useReducedMotion();
  const step = 360 / nights.length;

  // The ring is a cylinder: each night sits at its own angle, pushed out by a radius derived from the real
  // card width, so the faces meet edge to edge at any viewport without a gap or an overlap.
  useEffect(() => {
    const el = card.current;
    if (!el) return;
    const measure = () => {
      const width = el.getBoundingClientRect().width;
      if (width > 0) setRadius(Math.round(width / 2 / Math.tan(Math.PI / nights.length)));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      gsap.fromTo(q("[data-head] > *"), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 78%" } });
      if (reduced) return;
      // Scrolling the pinned section turns the ring one full revolution, so every night passes the front.
      gsap.fromTo(
        q("[data-ring]"),
        { rotateY: 0 },
        { rotateY: -360, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 1 } },
      );
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section ref={root} id="gallery" className="relative" style={{ height: "320vh" }} aria-label="The nights">
      <div className="sticky top-0 flex h-svh w-full flex-col items-center justify-center overflow-hidden px-5">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.16]" style={{ zIndex: "var(--z-background)" }}>
          <Mandala className="top-1/2 left-1/2 w-[min(140vw,1100px)] -translate-x-1/2 -translate-y-1/2" seconds={220} />
        </div>
        <MandalaArt className="top-1/2 -left-[30vw] h-[60vw] w-[60vw] -translate-y-1/2 text-antique opacity-[0.3] sm:-left-[16vw] sm:h-[36vw] sm:w-[36vw]" turn={140} strokeWidth={0.5} />
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ zIndex: "var(--z-atmosphere)", background: "radial-gradient(75% 60% at 50% 50%, rgba(7,5,4,0.62) 0%, rgba(7,5,4,0.88) 100%)" }} />

        <div data-head className="relative mb-6 text-center sm:mb-10" style={{ zIndex: "var(--z-content)" }}>
          <span className="label text-antique">The nights</span>
          <h2 className="display-type mt-2 text-[clamp(1.8rem,4vw,3rem)] text-ivory [text-shadow:0_6px_30px_rgba(0,0,0,0.6)]">Ten nights, as they happen.</h2>
          <div className="divider-carved mx-auto mt-4 w-[min(80vw,420px)]">
            <Rosette />
          </div>
        </div>

        <div ref={stage} className="relative h-[50svh] w-full sm:h-[56svh]" style={{ zIndex: "var(--z-content)", perspective: "2200px" }}>
          {/* Pull the cylinder back by its own radius so the front card sits on the screen plane. */}
          <div className="absolute inset-0" style={{ transformStyle: "preserve-3d", transform: `translateZ(-${radius}px) rotateX(-6deg)` }}>
            {/* A slow idle turn underneath the scroll-driven one, so the ring is never completely still. */}
            <div className={cx("absolute inset-0", !reduced && "ring-drift")}>
              <div data-ring className="absolute inset-0 will-change-transform" style={{ transformStyle: "preserve-3d" }}>
                {nights.map((shot, i) => (
                  <button
                    key={shot.file}
                    ref={i === 0 ? card : undefined}
                    type="button"
                    aria-label={`View ${shot.title}`}
                    onClick={() => setOpen(shot)}
                    className="frame-ancient frame-pips group absolute top-1/2 left-1/2 h-[42svh] w-[min(52vw,270px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-maroon text-left sm:h-[46svh] sm:w-[min(24vw,270px)]"
                    style={{ transform: `rotateY(${i * step}deg) translateZ(${radius}px)`, backfaceVisibility: "hidden" }}
                  >
                    <Picture image={shot} className="scale-[1.08] transition-transform duration-700 ease-out group-hover:scale-100" />
                    <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(53,10,8,0.30), transparent 34%, rgba(7,5,4,0.90))" }} />
                    <span className="display-type absolute top-3 left-4 text-[clamp(1.5rem,2.6vw,2.2rem)] leading-none text-mukut">{shot.n}</span>
                    <div className="absolute inset-x-4 bottom-4">
                      <h3 className="display-type text-xl text-ivory">{shot.title}</h3>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="relative mt-6 text-center text-xs text-ivory/60" style={{ zIndex: "var(--z-content)" }}>
          Scroll to turn the circle · tap a night to view it full screen
        </p>
      </div>
      {open && <Lightbox shot={open} onClose={() => setOpen(null)} />}
    </section>
  );
}

// ---------------------------------------------------------------- reveal helpers

const START = "top 82%";

function Lines({ lines, as: Tag = "h2", className, stagger = 0.1 }: { lines: string[]; as?: "h2" | "p"; className?: string; stagger?: number }) {
  const ref = useRef<HTMLHeadingElement & HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      gsap.from(ref.current.querySelectorAll("[data-line]"), { yPercent: 108, duration: 1.6, ease: "power4.out", stagger, scrollTrigger: { trigger: ref.current, start: START } });
    },
    { scope: ref, dependencies: [reduced] },
  );
  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <span data-line className="block">
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}

function FadeUp({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      gsap.from(ref.current, { y: 40, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: START } });
    },
    { scope: ref, dependencies: [reduced] },
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------- details and location

export function Details() {
  return (
    <section id="details" className="relative overflow-hidden px-5 py-20 sm:px-10 sm:py-24" aria-label="The details">
      <Backdrop />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ zIndex: "var(--z-geometry)" }}>
        <Mandala className="top-1/2 left-1/2 w-[min(120vw,860px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.13]" seconds={180} reverse />
      </div>
      <MandalaArt className="top-1/2 -left-[30vw] h-[60vw] w-[60vw] -translate-y-1/2 text-antique opacity-[0.3] md:-left-[14%] md:h-[40vw] md:max-h-[620px] md:w-[40vw] md:max-w-[620px]" turn={100} />
      <MandalaArt variant="chakra" className="top-1/2 -right-[30vw] h-[60vw] w-[60vw] -translate-y-1/2 text-antique opacity-[0.3] md:-right-[14%] md:h-[40vw] md:max-h-[620px] md:w-[40vw] md:max-w-[620px]" turn={-100} reverse />
      <div className="frame-ancient frame-pips bg-jaali-soft relative mx-auto max-w-3xl bg-maroon/25 px-6 py-12 text-center sm:px-14 sm:py-14" style={{ zIndex: "var(--z-content)" }}>
        <div aria-hidden className="relative mx-auto mb-7 h-16 w-16 text-mukut/70 sm:h-20 sm:w-20">
          <MandalaArt variant="medallion" className="inset-0" spin={60} strokeWidth={1.4} />
        </div>
        <FadeUp className="mt-0">
          <p className="display-type bg-[linear-gradient(100deg,var(--color-antique)_0%,var(--color-gold)_55%,var(--color-ivory)_100%)] bg-clip-text text-[clamp(2.2rem,6vw,4.4rem)] leading-none font-semibold text-transparent">{site.dates}</p>
          <p className="label mt-3 text-antique">{site.location}</p>
        </FadeUp>
        <div className="divider-carved my-8">
          <Rosette />
        </div>
        <Lines lines={["Ten nights. One circle."]} className="display-type text-[clamp(1.7rem,4vw,2.8rem)] text-ivory" />
        <FadeUp className="mt-6 text-sm text-ivory/55 sm:text-base">
          <p>Onward {site.gateEntry}</p>
        </FadeUp>
        <div className="divider-carved my-8">
          <Rosette />
        </div>
        <Lines lines={["The Chakra turns", "until the sun returns."]} as="p" className="display-type text-[clamp(1.3rem,2.6vw,1.9rem)] leading-tight text-mukut/90" stagger={0.12} />
      </div>
    </section>
  );
}

export function Venue() {
  return (
    <section id="venue" className="relative overflow-hidden px-5 py-16 sm:px-10 sm:py-16 lg:py-14" aria-label="Location">
      <Backdrop />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ zIndex: "var(--z-geometry)" }}>
        <Mandala className="-top-[18%] -left-[12%] w-[min(70vw,520px)] opacity-[0.16]" seconds={200} />
      </div>
      <MandalaArt variant="chakra" className="-right-[20%] -bottom-[35%] h-[min(110vw,640px)] w-[min(110vw,640px)] text-antique opacity-[0.26]" turn={-110} reverse />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-10" style={{ zIndex: "var(--z-content)" }}>
        <FadeUp className="mt-0">
          <h2 className="text-[clamp(2.6rem,6vw,4.4rem)] leading-[1.05] font-semibold text-ivory">Location</h2>
          <p className="mt-5 text-xl tracking-[0.06em] text-mukut sm:text-2xl">{site.venueName}</p>
          <p className="mt-2 text-lg leading-relaxed text-ivory/70 sm:text-xl">{site.venueStreet}</p>
          <p className="mt-6 max-w-[42ch] text-sm leading-relaxed text-ivory/55">{venueMap.routeNote}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={venueMap.googleDirections} target="_blank" rel="noreferrer noopener" className="cta-label inline-flex min-h-11 items-center rounded-full border border-mukut bg-mukut px-5 py-2.5 text-obsidian transition-colors duration-500 hover:border-gold hover:bg-gold">
              Get directions
            </a>
            <a href={site.maps} target="_blank" rel="noreferrer noopener" className="cta-label inline-flex min-h-11 items-center rounded-full border border-antique/40 px-5 py-2.5 text-ivory/80 transition-colors duration-500 hover:border-mukut hover:text-ivory">
              Open in Google Maps
            </a>
          </div>
        </FadeUp>
        <FadeUp className="mt-0">
          <div className="frame-ancient relative aspect-4/3 w-full overflow-hidden sm:aspect-16/10">
            <span className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-sm bg-obsidian/85 px-3 py-1.5 text-xs tracking-[0.14em] text-mukut uppercase">{site.name} 2026</span>
            <VenueMap compact />
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
