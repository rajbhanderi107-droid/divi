import { useEffect, useRef } from "react";
import { cover, figures, loops, media, site } from "./content";
import { gsap, useGSAP, useIsMobile } from "./hooks";
import { MandalaArt, Rosette } from "./mandala-art";

// Darshan — the head of the page. Mataji is held in an arched niche as a film rather than a still, lit from
// behind by a slow loop of diya light, with the gold mandalas turning off-axis so nothing sits symmetrically
// about Her face. Everything below this section turns around Her.

const NICHE_VIGNETTE = "radial-gradient(90% 70% at 35% 40%, transparent 50%, rgba(20,8,4,0.55) 100%)";
const HALO = "radial-gradient(circle, rgba(255,186,90,0.32) 0%, rgba(214,120,40,0.14) 40%, transparent 70%)";
const FIGURE_BLOOM = "radial-gradient(circle, rgba(240,193,75,0.20) 0%, rgba(143,23,18,0.12) 45%, transparent 70%)";
// A highlight that crosses the heading once. The stops sit close together so it reads as a sweep of light
// over ivory rather than a gradient the type is painted in.
const SWEEP =
  "linear-gradient(100deg,var(--color-ivory) 0%,var(--color-ivory) 38%,#fff6dd 50%,var(--color-ivory) 62%,var(--color-ivory) 100%)";

export function Darshan() {
  const root = useRef<HTMLElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  const glow = useRef<HTMLVideoElement>(null);
  const mobile = useIsMobile();

  // Both films are decorative. They run only while the head page is on screen, and the ambient one is left
  // off a phone entirely — two decoding video layers is what costs frames on a mid-range handset.
  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const films = [film.current, mobile ? null : glow.current].filter(Boolean) as HTMLVideoElement[];
    let onScreen = false;
    const tryPlay = () => {
      if (onScreen) films.forEach((v) => v.play().catch(() => {}));
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) tryPlay();
        else films.forEach((v) => v.pause());
      },
      { rootMargin: "20%" },
    );
    io.observe(el);
    document.addEventListener("pointerdown", tryPlay);
    document.addEventListener("keydown", tryPlay);
    return () => {
      io.disconnect();
      document.removeEventListener("pointerdown", tryPlay);
      document.removeEventListener("keydown", tryPlay);
    };
  }, [mobile]);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);

      // Entrances run FROM the offset state, so the resting DOM is the visible one and nothing can be
      // stranded invisible. They are deliberately not gated on the loader: a prop that flips after mount
      // changes this hook's dependencies mid-flight and leaves the timeline frozen part-way through, which
      // is exactly how the head page came up half-lit. The delay simply lets the loader clear.
      gsap
        .timeline({ defaults: { ease: "power3.out" }, delay: 0.85 })
        .from(q("[data-niche]"), { yPercent: 12, opacity: 0, filter: "brightness(0.3)", duration: 2.2 }, 0)
        .from(q("[data-copy] > *"), { yPercent: 60, opacity: 0, duration: 1.1, stagger: 0.1 }, 0.35)
        .from(q("[data-bell]"), { yPercent: 120, rotate: -6, duration: 1.8, ease: "power2.out" }, 0.2)
        .from(q("[data-figure]"), { yPercent: 18, opacity: 0, duration: 1.6 }, 0.9);

      gsap.fromTo(
        q("[data-sweep]"),
        { backgroundPosition: "-150% 0" },
        { backgroundPosition: "250% 0", duration: 2.4, ease: "power2.inOut", delay: 2.4 },
      );

      gsap.to(q("[data-bell]"), { rotate: 3.5, duration: 5.1, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2.8 });
      gsap.to(q("[data-cue]"), { yPercent: 260, duration: 1.8, repeat: -1, ease: "power2.inOut" });

      // Scrolling away, the niche sinks slower than the page and the words lift off it.
      gsap.to(q("[data-niche]"), { yPercent: 10, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
      gsap.to(q("[data-copy]"), { y: -60, opacity: 0.25, ease: "none", scrollTrigger: { trigger: root.current, start: "30% top", end: "bottom top", scrub: true } });
      gsap.to(q("[data-figure]"), { yPercent: -14, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 1 } });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="home" className="relative flex min-h-[130svh] items-center overflow-hidden px-5 py-28 sm:px-10" aria-label={`${site.name} — દર્શન`}>
      <picture aria-hidden className="pointer-events-none absolute inset-0" style={{ zIndex: "var(--z-background)" }}>
        <source media="(min-width: 640px)" srcSet={media.heroBg.webp} type="image/webp" />
        <source media="(min-width: 640px)" srcSet={media.heroBg.file} />
        <source srcSet={media.heroBg.webpMobile} type="image/webp" />
        <img src={media.heroBg.fileMobile} alt="" fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
      </picture>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ zIndex: "var(--z-atmosphere)", background: "rgba(7,5,4,0.62)" }} />

      {/* Diya light, moving. Screen-blended at low strength so it reads as the room breathing, not as a video. */}
      <video
        ref={glow}
        src={loops.matajiLight}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        tabIndex={-1}
        className="pointer-events-none absolute inset-0 hidden h-full w-full object-cover opacity-[0.28] mix-blend-screen sm:block"
        style={{ zIndex: "var(--z-atmosphere)" }}
      />

      {/* The mandalas sit low and turned off-axis so they read as a shrine screen behind Her, not a halo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[min(108vw,920px)] -translate-x-1/2 -translate-y-1/2"
        style={{ zIndex: "var(--z-geometry)", transform: "translate(-50%, 18%) rotate(-30deg)" }}
      >
        <div className="absolute inset-[18%] rounded-full" style={{ background: HALO }} />
        <MandalaArt className="inset-0 opacity-45" spin={220} strokeWidth={0.34} />
        <MandalaArt variant="chakra" className="inset-[14%] opacity-40" spin={150} reverse strokeWidth={0.42} />
      </div>

      {/* The garbo, set into the geometry layer and drifting against the scroll. */}
      <div data-figure aria-hidden className="pointer-events-none absolute -bottom-[8%] right-[2%] h-[min(56vw,400px)] w-[min(56vw,400px)] opacity-60 will-change-transform sm:right-[6%]" style={{ zIndex: "var(--z-geometry)" }}>
        <div className="absolute inset-[-16%] rounded-full" style={{ background: FIGURE_BLOOM }} />
        <img src={figures.garbo} alt="" loading="lazy" decoding="async" className="relative h-full w-full object-contain" />
      </div>

      <picture aria-hidden className="pointer-events-none absolute top-0 right-[8%] block w-[min(26vw,200px)] origin-top sm:right-[16%]" style={{ zIndex: "var(--z-foreground)" }}>
        <source srcSet={media.bell.webp} type="image/webp" />
        <img data-bell src={media.bell.file} alt="" decoding="async" className="w-full opacity-85 drop-shadow-[0_24px_36px_rgba(0,0,0,0.6)]" />
      </picture>

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" style={{ zIndex: "var(--z-content)" }}>
        <div data-niche className="mx-auto w-full max-w-[min(78vw,440px)] will-change-transform">
          <div className="relative overflow-hidden rounded-t-[999px] border border-antique/60 bg-maroon p-2 shadow-[0_40px_120px_-30px_rgba(240,160,60,0.45)]">
            <div className="relative aspect-3/4 overflow-hidden rounded-t-[999px]">
              <video
                ref={film}
                src={loops.matajiMukut}
                poster={cover.matajiMukut.webp}
                muted
                loop
                playsInline
                preload="none"
                aria-label="મા દુર્ગા, મુગટ ધારણ કરેલાં, દીવાના પ્રકાશમાં"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: "18% 30%" }}
              />
              <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: NICHE_VIGNETTE }} />
            </div>
          </div>
        </div>

        <div data-copy className="text-center lg:text-left">
          <span lang="gu" className="label-gu text-antique">
            દર્શન
          </span>
          {/* Gujarati sits on Anek, not the Latin-only display face, so the heading takes display-gu — its
              matras need the line height that display-type deliberately takes away. */}
          <h1
            data-sweep
            lang="gu"
            className="display-gu mt-4 bg-clip-text text-[clamp(2.1rem,4.8vw,4.2rem)] text-transparent [background-size:250%_100%] [text-shadow:0_8px_40px_rgba(0,0,0,0.6)]"
            style={{ backgroundImage: SWEEP }}
          >
            દરેક વર્તુળ
            <br />
            માથી શરૂ થાય છે.
          </h1>
          <div className="divider-carved mx-auto mt-6 w-[min(80vw,360px)] lg:mx-0">
            <Rosette />
          </div>
          <p lang="gu" className="mx-auto mt-6 max-w-[42ch] text-lg leading-[1.85] text-ivory/80 lg:mx-0">
            મા દુર્ગાની આસપાસ દસ રાતનો ગરબો — ઢોલ શરૂ થાય છે, દીવો પ્રગટે છે, અને સૂરજ પાછો આવે ત્યાં સુધી વર્તુળ ફરતું રહે છે.
          </p>
        </div>
      </div>

      <a href="#album" aria-label="નીચે સ્ક્રોલ કરો" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-ivory/60 lg:flex" style={{ zIndex: "var(--z-content)" }}>
        <span lang="gu" className="label-gu">સ્ક્રોલ</span>
        <span className="relative h-10 w-px overflow-hidden bg-antique/25">
          <span data-cue className="absolute top-[-40%] left-0 h-[40%] w-px bg-mukut" />
        </span>
      </a>
    </section>
  );
}
