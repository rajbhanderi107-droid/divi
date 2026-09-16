import { useRef } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { opening, site } from "./content";
import { gsap, useGSAP } from "./hooks";

// The opening page. The canopy of lights is held behind a two-axis scrim so the Gujarati title reads at any
// size, and the title rises one grapheme cluster at a time out of its own mask — Gujarati matras sit above
// and below the baseline, so the mask is padded rather than clipped tight.

const SIDE_SCRIM = "linear-gradient(90deg, rgba(7,5,4,0.94) 0%, rgba(7,5,4,0.72) 38%, rgba(7,5,4,0.30) 72%, rgba(7,5,4,0.20) 100%)";
const TOP_SCRIM = "linear-gradient(180deg, rgba(7,5,4,0.72) 0%, rgba(7,5,4,0) 26%, rgba(7,5,4,0.55) 74%, rgba(7,5,4,0.92) 100%)";

const factIcons = [Calendar, MapPin, Clock];

export function Opening({ start = true }: { start?: boolean }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const clusters = q("[data-cluster]");
      const rise = q("[data-rise]");

      gsap.set(clusters, { yPercent: 115, opacity: 0 });
      gsap.set(rise, { y: 34, opacity: 0 });
      gsap.set(q("[data-plate]"), { scale: 1.08 });

      if (start) {
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .to(q("[data-plate]"), { scale: 1, duration: 2.6, ease: "power2.out" }, 0)
          .to(clusters, { yPercent: 0, opacity: 1, duration: 1.3, stagger: 0.07 }, 0.25)
          .to(rise, { y: 0, opacity: 1, duration: 1, stagger: 0.09 }, 0.7);
      }

      // Leaving the opening, the lights sink slower than the page and the words lift off them.
      gsap.to(q("[data-plate]"), {
        yPercent: 12,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(q("[data-copy]"), {
        y: -70,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "25% top", end: "bottom top", scrub: true },
      });
    },
    { scope: root, dependencies: [start] },
  );

  return (
    <section ref={root} className="relative h-svh overflow-hidden bg-obsidian" style={{ zIndex: "var(--z-content)" }} aria-label={`${site.name} — ${opening.titlePlain}`}>
      <div data-plate className="absolute inset-0 will-change-transform">
        <img src={opening.backdrop} alt="" fetchPriority="high" decoding="async" className="h-full w-full object-cover" style={{ objectPosition: opening.focal }} />
        <div aria-hidden className="absolute inset-0" style={{ background: SIDE_SCRIM }} />
        <div aria-hidden className="absolute inset-0" style={{ background: TOP_SCRIM }} />
      </div>

      <div data-copy className="relative mx-auto flex h-full w-full max-w-416 flex-col justify-end px-5 pb-[9svh] sm:px-10" style={{ zIndex: "var(--z-content)" }}>
        <p data-rise lang="gu" className="label-gu text-antique/90">
          {opening.eyebrow}
        </p>

        <h1 lang="gu" className="display-gu mt-5 text-[clamp(2.6rem,8.4vw,8rem)] text-ivory [text-shadow:0_14px_60px_rgba(0,0,0,0.75)]">
          {/* The title is read whole by a screen reader; the clusters below are the visual performance. */}
          <span className="sr-only">{opening.titlePlain}</span>
          <span aria-hidden className="block overflow-hidden pb-[0.12em]">
            {opening.title.map((cluster, i) => (
              <span key={i} data-cluster className="inline-block will-change-transform">
                {cluster === " " ? "\u00a0" : cluster}
              </span>
            ))}
          </span>
        </h1>

        <p data-rise lang="gu" className="mt-5 max-w-2xl text-[clamp(1rem,1.7vw,1.3rem)] leading-[1.75] text-ivory/75">
          {opening.line}
        </p>

        <div data-rise className="mt-9 flex flex-wrap gap-3">
          <button type="button" data-cursor="cta" onClick={() => document.getElementById("buy-btn")?.click()} className="cta-label min-h-12 cursor-pointer rounded-full border border-mukut bg-mukut px-7 py-3 text-obsidian transition-colors duration-500 hover:border-gold hover:bg-gold">
            <span lang="gu" className="label-gu text-[0.9rem]">{opening.book}</span>
          </button>
          <a href="#darshan" className="cta-label inline-flex min-h-12 items-center rounded-full border border-ivory/35 bg-obsidian/40 px-7 py-3 text-ivory transition-colors duration-500 hover:border-mukut hover:text-mukut">
            <span lang="gu" className="label-gu text-[0.9rem]">{opening.enter}</span>
          </a>
        </div>

        <ul data-rise className="mt-10 grid gap-3 sm:grid-cols-3">
          {opening.facts.map(({ head, sub }, i) => {
            const Icon = factIcons[i];
            return (
              <li key={head} className="flex min-h-14 items-center gap-3 rounded-2xl border border-antique/20 bg-obsidian/55 px-5 py-3 backdrop-blur-[2px]">
                <Icon size={18} strokeWidth={1.5} className="shrink-0 text-mukut" aria-hidden />
                <span lang="gu" className="leading-tight">
                  <span className="block text-sm text-ivory/90">{head}</span>
                  <span className="label-gu block text-[0.72rem] text-antique/80">{sub}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
