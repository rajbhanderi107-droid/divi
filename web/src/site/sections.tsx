import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { nights, scenes, site, type Shot } from "./content";
import { gsap, useGSAP, useIsMobile, useReducedMotion } from "./hooks";
import { Mandala } from "./mandala";
import { MandalaArt, Rosette } from "./mandala-art";
import { VenueMap } from "@/components/venue-map";
import { venueMap } from "@/content";

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(" ");

// ---------------------------------------------------------------- the ritual: five photographs that cross-fade on scroll

const sideClass = { left: "left-[6vw] sm:left-[8vw] items-start text-left", right: "right-[6vw] sm:right-[8vw] items-end text-right" };
const alignClass = { start: "top-[22%]", center: "top-1/2 -translate-y-1/2", end: "bottom-[22%]" };

export function Ritual() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const mobile = useIsMobile();

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      scenes.forEach((scene, i) => {
        const copy = q(`[data-scene="${scene.id}"]`);
        const photo = q(`[data-photo="${scene.id}"]`);
        const first = i === 0;
        if (first) gsap.set(photo, { opacity: 1 });
        if (reduced) {
          gsap.set(copy, { opacity: 1, y: 0 });
          gsap.set(photo, { opacity: 1 });
          return;
        }
        // A short scrub (rather than the photos' lazier one) so a caption finishes fading out before the next
        // scene's scrub has caught up to fading its own in — otherwise the two captions read as overlapping text.
        gsap
          .timeline({ scrollTrigger: { trigger: root.current, start: `${scene.from * 100}% top`, end: `${scene.to * 100}% top`, scrub: 0.3 } })
          .fromTo(copy, { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out" })
          .to(copy, { duration: 1.4 })
          .to(copy, { opacity: 0, y: -34, duration: 1, ease: "power2.in" });
        gsap
          .timeline({ scrollTrigger: { trigger: root.current, start: `${Math.max(0, scene.from - 0.05) * 100}% top`, end: `${Math.min(1, scene.to + 0.05) * 100}% top`, scrub: 1 } })
          .fromTo(photo, { opacity: first ? 1 : 0, scale: 1.06 }, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0)
          .to(photo, { scale: 1, duration: 3.4, ease: "none" }, 0)
          .to(photo, { opacity: 0, duration: 0.5, ease: "power2.in" }, 2.9);
      });
      if (!reduced) {
        gsap.fromTo(q("[data-outro]"), { opacity: 0 }, { opacity: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "88% top", end: "bottom bottom", scrub: true } });
        // The section is pinned the instant it's reached, so without this the album's paper tone would cut
        // straight to the first photograph; this eases up out of the same dark the outro fades down into.
        gsap.fromTo(q("[data-intro]"), { opacity: 1 }, { opacity: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "6% top", scrub: true } });
      }
    },
    { scope: root, dependencies: [reduced] },
  );

  // Decode the five photographs ahead of time (off the main thread) as the section approaches, so the cross-fades never
  // wait on a large image decode mid-scroll.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        el.querySelectorAll("img").forEach((img) => void img.decode?.().catch(() => {}));
      },
      { rootMargin: "150% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mobile]);

  // Reduced motion: no pinned cross-fade (the stacked captions would overlap), just the five photographs in sequence.
  if (reduced)
    return (
      <section ref={root} id="film" className="relative bg-obsidian" aria-label="Divi Garba — the ritual">
        {scenes.map((s) => (
          <div key={s.id} className="relative flex min-h-[80svh] w-full overflow-hidden">
            <picture className="contents">
              <source srcSet={(mobile ? s.image.fileMobile : s.image.file).replace(/\.jpg$/, ".webp")} type="image/webp" />
              <img src={mobile ? s.image.fileMobile : s.image.file} alt={s.image.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: s.image.focal }} />
            </picture>
            <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(7,5,4,0.72) 0%, rgba(7,5,4,0.30) 40%, rgba(7,5,4,0.86) 100%)" }} />
            <div className={cx("relative mx-auto flex w-full max-w-6xl flex-col justify-end px-[6vw] py-20", s.side === "right" ? "items-end text-right" : "items-start text-left")}>
              <span className="text-[clamp(0.8rem,1.25vw,1.05rem)] tracking-[0.34em] text-antique uppercase">{s.eyebrow}</span>
              <h2 className="display-type mt-5 max-w-[min(86vw,38rem)] text-[clamp(2.3rem,5.6vw,4.6rem)] leading-[1.03] text-ivory">{s.heading}</h2>
              {s.body && <p className="mt-4 max-w-[40ch] text-base leading-relaxed text-ivory/75 sm:text-lg">{s.body}</p>}
            </div>
          </div>
        ))}
      </section>
    );

  return (
    <section ref={root} id="film" className="relative" style={{ height: "520vh" }} aria-label="Divi Garba — the ritual">
      <div className="sticky top-0 h-svh w-full overflow-hidden bg-obsidian">
        {scenes.map((s) => (
          <picture key={s.id} className="contents">
            <source srcSet={(mobile ? s.image.fileMobile : s.image.file).replace(/\.jpg$/, ".webp")} type="image/webp" />
            <img data-photo={s.id} src={mobile ? s.image.fileMobile : s.image.file} alt={s.image.alt} decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-0 will-change-[transform,opacity]" style={{ objectPosition: s.image.focal, zIndex: "var(--z-background)" }} />
          </picture>
        ))}
        <div aria-hidden className="absolute inset-0" style={{ zIndex: "var(--z-atmosphere)", background: "linear-gradient(180deg, rgba(7,5,4,0.78) 0%, rgba(7,5,4,0.30) 34%, rgba(7,5,4,0.86) 100%), radial-gradient(70% 55% at 50% 48%, rgba(216,100,30,0.16), transparent 72%)" }} />
        {scenes.map((s) => (
          <div key={s.id} data-scene={s.id} className={cx("absolute flex max-w-[min(86vw,38rem)] flex-col opacity-0", sideClass[s.side], alignClass[s.align])} style={{ zIndex: "var(--z-content)" }}>
            <span className="text-[clamp(0.8rem,1.25vw,1.05rem)] tracking-[0.34em] text-antique uppercase">{s.eyebrow}</span>
            <h2 className="display-type mt-5 text-[clamp(2.3rem,5.6vw,4.6rem)] leading-[1.03] text-ivory">{s.heading}</h2>
            <p className="mt-4 max-w-[40ch] text-base leading-relaxed text-ivory/70 sm:text-lg">{s.body}</p>
          </div>
        ))}
        <div data-intro aria-hidden className="pointer-events-none absolute inset-0" style={{ zIndex: "var(--z-foreground)", background: "var(--color-obsidian)" }} />
        <div data-outro aria-hidden className="pointer-events-none absolute inset-0 opacity-0" style={{ zIndex: "var(--z-foreground)", background: "linear-gradient(180deg, rgba(26,11,13,0.6), var(--color-obsidian) 78%)" }} />
      </div>
    </section>
  );
}

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
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("lightbox-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
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
  const [open, setOpen] = useState<Shot | null>(null);
  const reduced = useReducedMotion();
  useGSAP(
    () => {
      if (reduced || !root.current) return;
      gsap.from(root.current.querySelector("[data-row]"), { opacity: 0, y: 40, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 74%" } });
      gsap.from(root.current.querySelectorAll("[data-head] > *"), { opacity: 0, y: 22, duration: 0.9, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 82%" } });
      gsap.to(root.current.querySelector("[data-ground]"), { opacity: 0.16, duration: 2, ease: "power2.out", scrollTrigger: { trigger: root.current, start: "top 80%" } });
    },
    { scope: root, dependencies: [reduced] },
  );
  return (
    <section ref={root} id="gallery" className="relative overflow-hidden px-5 py-16 sm:px-10 sm:py-20" aria-label="The nights">
      {/* A large mandala turns slowly behind the nights (it fades in with the section). */}
      <div data-ground aria-hidden className="pointer-events-none absolute inset-0 opacity-0" style={{ zIndex: "var(--z-background)" }}>
        <Mandala className="top-1/2 left-1/2 w-[min(140vw,1100px)] -translate-x-1/2 -translate-y-1/2" seconds={220} />
      </div>
      <div aria-hidden className="bg-jaali jaali-fade pointer-events-none absolute inset-0 opacity-[0.08]" style={{ zIndex: "var(--z-background)" }} />
      <MandalaArt className="top-1/2 -left-[30vw] h-[60vw] w-[60vw] -translate-y-1/2 text-antique opacity-[0.32] sm:-left-[16vw] sm:h-[36vw] sm:w-[36vw]" turn={140} strokeWidth={0.5} />
      <MandalaArt variant="chakra" className="top-1/2 -right-[30vw] h-[60vw] w-[60vw] -translate-y-1/2 text-antique opacity-[0.32] sm:-right-[16vw] sm:h-[36vw] sm:w-[36vw]" turn={-140} reverse strokeWidth={0.5} />
      <div className="relative mx-auto max-w-[1600px]" style={{ zIndex: "var(--z-content)" }}>
        <div data-head className="mb-9 text-center">
          <span className="label text-antique">The nights</span>
          <h2 className="display-type mt-2 text-[clamp(1.6rem,3.4vw,2.4rem)] text-ivory">Ten nights, as they happen.</h2>
          <div className="divider-carved mt-4">
            <Rosette />
          </div>
        </div>
        <div data-row className="overflow-hidden">
          <div className="flex w-max gap-4 will-change-transform sm:gap-6" style={reduced ? undefined : { animation: "marquee-left 91s linear infinite" }}>
            {[...nights, ...nights].map((shot, i) => (
              <button
                key={`${shot.file}-${i}`}
                type="button"
                aria-label={`View ${shot.title}`}
                tabIndex={i < nights.length ? undefined : -1}
                onClick={() => setOpen(shot)}
                className="frame-ancient frame-pips group relative h-[46svh] w-[70vw] shrink-0 overflow-hidden bg-maroon text-left sm:h-[58svh] sm:w-[30vw] md:w-[24vw]"
              >
                <Picture image={shot} className="scale-[1.08] transition-transform duration-700 ease-out group-hover:scale-100" />
                <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(53,10,8,0.30), transparent 34%, rgba(7,5,4,0.90))" }} />
                <span className="display-type absolute top-3 left-4 text-[clamp(1.7rem,3vw,2.6rem)] leading-none text-mukut">{shot.n}</span>
                <div className="absolute inset-x-4 bottom-4">
                  <h3 className="display-type text-2xl text-ivory">{shot.title}</h3>
                </div>
              </button>
            ))}
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-ivory/55">Click a night to view it full screen.</p>
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
