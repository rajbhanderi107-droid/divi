import { useEffect, useRef } from "react";
import { chapters, type Chapter } from "./content";
import { gsap, useGSAP } from "./hooks";

// The five chapters. Each is a 230svh scroll that pins one full-bleed film: the film fades up, drifts and
// settles while the Gujarati numeral, eyebrow and heading rise over it, then the frame fades out as the next
// chapter takes the pin. Four of them are followed by a single line held alone on the dark, which gives the
// eye somewhere to rest between films. Only the chapter on screen is decoded and playing.

const align = {
  left: "items-start text-left mr-auto",
  center: "items-center text-center mx-auto",
  right: "items-end text-right ml-auto",
} as const;

// A radial scrim that keeps the lower third readable, and a foot gradient that hands off to the next chapter.
const VIGNETTE =
  "radial-gradient(64% 52% at 50% 74%, rgba(7,5,4,0.86) 0%, rgba(7,5,4,0.48) 52%, rgba(7,5,4,0.22) 100%)";
const FOOT = "linear-gradient(180deg, rgba(7,5,4,0) 0%, rgba(7,5,4,0.85) 100%)";

/** The gold word falls at the start of the line as often as the end, so all three parts are rendered. */
function Split({ before, accent, after }: { before: string; accent: string; after: string }) {
  return (
    <>
      {before}
      <em className="font-normal text-mukut not-italic">{accent}</em>
      {after}
    </>
  );
}

function Interlude({ line }: { line: NonNullable<Chapter["interlude"]> }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.fromTo(
        root.current!.querySelector("p"),
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 78%" } },
      );
    },
    { scope: root },
  );
  return (
    <div ref={root} className="relative flex min-h-[52svh] items-center justify-center px-6 py-24 sm:px-10" style={{ zIndex: "var(--z-content)" }}>
      <p lang="gu" className="display-gu max-w-3xl text-center text-[clamp(1.2rem,2.6vw,2.1rem)] font-medium text-ivory/75">
        <Split {...line} />
      </p>
    </div>
  );
}

function ChapterScene({ chapter }: { chapter: Chapter }) {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  // Decode and play only while the chapter is on screen. Five films left running at once is what makes a
  // phone drop frames, so everything off screen is paused. If a browser refuses to start a muted film
  // without a gesture, the poster holds the frame and the first tap or key starts it.
  useEffect(() => {
    const el = root.current;
    const film = video.current;
    if (!el || !film || typeof IntersectionObserver === "undefined") return;
    let onScreen = false;
    const tryPlay = () => {
      if (onScreen) film.play().catch(() => {});
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) tryPlay();
        else film.pause();
      },
      { rootMargin: "25%" },
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
      const frame = q("[data-frame]");
      const plate = q("[data-plate]");
      const lines = q("[data-line]");

      gsap.set(frame, { opacity: 0 });
      gsap.set(lines, { opacity: 0, yPercent: 55 });

      // Fade the frame up as the chapter takes the pin and back out as it leaves, so two films never sit on
      // top of each other at full strength. One timeline owns the property across the whole pin — two
      // scrubbed tweens on the same property fight over who captured the start value.
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } })
        .fromTo(frame, { opacity: 0 }, { opacity: 1, duration: 1, ease: "none" })
        .to(frame, { opacity: 1, duration: 2, ease: "none" })
        .to(frame, { opacity: 0, duration: 1, ease: "none" });

      // A slow drift across the whole pin: the film eases from slightly over-scaled and high to settled.
      gsap.fromTo(
        plate,
        { yPercent: -5, scale: 1.1 },
        { yPercent: 4, scale: 1.02, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } },
      );

      // The type arrives once the chapter is actually held, not while it is still sliding in.
      gsap.to(lines, {
        opacity: 1,
        yPercent: 0,
        duration: 1.1,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 42%" },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id={chapter.id} className="relative h-[230svh]" style={{ zIndex: "var(--z-content)" }} aria-label={`${chapter.eyebrow} — ${chapter.before}${chapter.accent}${chapter.after}`}>
      <div className="sticky top-0 h-svh w-full overflow-hidden bg-obsidian">
        <div data-frame className="absolute inset-0">
          <div data-plate className="absolute inset-[-7%] will-change-transform">
            <video
              ref={video}
              src={chapter.video}
              poster={chapter.poster}
              muted
              loop
              playsInline
              preload="none"
              aria-hidden
              tabIndex={-1}
              className="h-full w-full object-cover"
              style={{ objectPosition: chapter.focal }}
            />
          </div>
          <div aria-hidden className="absolute inset-[-4%]" style={{ background: VIGNETTE }} />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/4" style={{ background: FOOT }} />
        </div>

        <div className="relative mx-auto flex h-full w-full max-w-416 items-end px-5 pb-[12svh] sm:px-10">
          <div className={`flex w-full max-w-2xl flex-col gap-3 ${align[chapter.side]}`}>
            <span data-line className="label-gu flex items-center gap-3 text-antique/90">
              <span className="text-mukut tabular-nums">{chapter.n}</span>
              <span aria-hidden className="h-px w-10 bg-antique/50" />
              {chapter.eyebrow}
            </span>
            <h2 data-line lang="gu" className="display-gu text-[clamp(2rem,5.4vw,4.6rem)] text-ivory [text-shadow:0_12px_50px_rgba(0,0,0,0.7)]">
              <Split before={chapter.before} accent={chapter.accent} after={chapter.after} />
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Chapters() {
  return (
    <>
      {chapters.map((chapter) => (
        <div key={chapter.id}>
          <ChapterScene chapter={chapter} />
          {chapter.interlude && <Interlude line={chapter.interlude} />}
        </div>
      ))}
    </>
  );
}
