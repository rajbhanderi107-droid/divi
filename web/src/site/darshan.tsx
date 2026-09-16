import { useEffect, useRef } from "react";
import { cover, loops, media, site } from "./content";
import { gsap, useGSAP } from "./hooks";
import { MandalaArt, Rosette } from "./mandala-art";

// Darshan — the head page. Mataji is held in an arched niche as a slow film rather than a still, with the
// gold mandalas turning behind her off-centre so nothing sits symmetrically about her face. The type rises
// beside her on desktop and beneath her on a phone.

const NICHE_VIGNETTE = "radial-gradient(90% 70% at 35% 40%, transparent 50%, rgba(20,8,4,0.55) 100%)";
const HALO = "radial-gradient(circle, rgba(255,186,90,0.32) 0%, rgba(214,120,40,0.14) 40%, transparent 70%)";

export function Darshan({ start = true }: { start?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const film = useRef<HTMLVideoElement>(null);

  // The niche film is decorative; it only runs while the head page is on screen. If a browser refuses to start
  // it without a gesture, the poster still holds Her face and the first tap or key starts the loop.
  useEffect(() => {
    const el = root.current;
    const video = film.current;
    if (!el || !video || typeof IntersectionObserver === "undefined") return;
    let onScreen = false;
    const tryPlay = () => {
      if (onScreen) video.play().catch(() => {});
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) tryPlay();
        else video.pause();
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
  }, []);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const niche = q("[data-niche]");
      const copy = q("[data-copy] > *");
      const bell = q("[data-bell]");

      gsap.set(niche, { yPercent: 12, opacity: 0, filter: "brightness(0.3)" });
      gsap.set(copy, { yPercent: 60, opacity: 0 });
      gsap.set(bell, { yPercent: 120, rotate: -6 });

      if (start) {
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .to(niche, { yPercent: 0, opacity: 1, filter: "brightness(1)", duration: 2.2 })
          .to(copy, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.1 }, 0.35)
          .to(bell, { yPercent: 0, rotate: 0, duration: 1.8, ease: "power2.out" }, 0.2);
      }

      // The bell keeps a slow sway of its own once it has dropped.
      gsap.to(bell, { rotate: 3.5, duration: 5.1, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2 });

      // Scrolling away, the niche sinks slower than the page and the words lift off it.
      gsap.to(niche, {
        yPercent: 10,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(q("[data-copy]"), {
        y: -60,
        opacity: 0.25,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "30% top", end: "bottom top", scrub: true },
      });
    },
    { scope: root, dependencies: [start] },
  );

  return (
    <section ref={root} id="darshan" className="relative flex min-h-[130svh] items-center overflow-hidden px-5 py-28 sm:px-10" aria-label={`${site.name} — Darshan`}>
      <picture aria-hidden className="pointer-events-none absolute inset-0" style={{ zIndex: "var(--z-background)" }}>
        <source media="(min-width: 640px)" srcSet={media.heroBg.webp} type="image/webp" />
        <source media="(min-width: 640px)" srcSet={media.heroBg.file} />
        <source srcSet={media.heroBg.webpMobile} type="image/webp" />
        <img src={media.heroBg.fileMobile} alt="" fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
      </picture>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ zIndex: "var(--z-atmosphere)", background: "rgba(7,5,4,0.62)" }} />

      {/* The mandalas sit low and turned off-axis so they read as a shrine screen behind her, not a halo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[min(150vw,1200px)] -translate-x-1/2 -translate-y-1/2"
        style={{ zIndex: "var(--z-geometry)", transform: "translate(-50%, 18%) rotate(-30deg)" }}
      >
        <div className="absolute inset-[18%] rounded-full" style={{ background: HALO }} />
        <MandalaArt className="inset-0 opacity-45" spin={220} strokeWidth={0.34} />
        <MandalaArt variant="chakra" className="inset-[14%] opacity-40" spin={150} reverse strokeWidth={0.42} />
      </div>

      <picture aria-hidden className="pointer-events-none absolute top-0 right-[8%] block w-[min(26vw,200px)] origin-top sm:right-[16%]" style={{ zIndex: "var(--z-foreground)" }}>
        <source srcSet={media.bell.webp} type="image/webp" />
        <img data-bell src={media.bell.file} alt="" decoding="async" className="w-full opacity-85 drop-shadow-[0_24px_36px_rgba(0,0,0,0.6)]" />
      </picture>

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" style={{ zIndex: "var(--z-content)" }}>
        <div data-niche className="mx-auto w-[min(78vw,440px)]">
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
                aria-label="Maa Durga, crowned, lit by diya"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: "18% 30%" }}
              />
              <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: NICHE_VIGNETTE }} />
            </div>
          </div>
        </div>

        <div data-copy className="text-center lg:text-left">
          <span className="label text-antique">
            <span lang="gu">દર્શન</span> · Darshan
          </span>
          <h2 className="display-type mt-4 text-[clamp(2.4rem,5.4vw,4.8rem)] leading-[1.02] text-ivory [text-shadow:0_8px_40px_rgba(0,0,0,0.6)]">
            Every circle
            <br />
            begins with Her.
          </h2>
          <div className="divider-carved mx-auto mt-6 w-[min(80vw,360px)] lg:mx-0">
            <Rosette />
          </div>
          <p className="mx-auto mt-6 max-w-[40ch] text-lg leading-relaxed text-ivory/80 lg:mx-0">
            Ten nights of Garba around Maa Durga — the dhol begins, the diya is lit, and the circle turns until the sun returns.
          </p>
        </div>
      </div>
    </section>
  );
}
