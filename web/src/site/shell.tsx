import { useEffect, useRef, useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { brand, media, site } from "./content";
import { gsap, useCoarsePointer, useGSAP, useIsMobile, useReducedMotion } from "./hooks";
import { Mandala } from "./mandala";
import { MandalaArt } from "./mandala-art";
import { lockScroll, startSmoothScroll } from "@/lib/scroll";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(startSmoothScroll, []);
  return <>{children}</>;
}

export function Loader({ onDone }: { onDone?: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const logo = useRef<HTMLImageElement>(null);
  const [done, setDone] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (done) return;
    lockScroll(true);
    return () => lockScroll(false);
  }, [done]);

  useGSAP(
    () => {
      if (reduced) {
        onDone?.();
        setDone(true);
        return;
      }
      gsap
        .timeline({ onComplete: () => setDone(true) })
        .fromTo(logo.current, { scale: 0, opacity: 1 }, { scale: 1, duration: 0.7, ease: "power3.in" })
        .to(logo.current, { scale: 1.2, duration: 0.2, ease: "power2.out" })
        .to(root.current, { opacity: 0, duration: 0.3, ease: "power2.inOut", onStart: () => onDone?.() }, "-=0.1");
    },
    { scope: root, dependencies: [reduced] },
  );

  if (done) return null;
  return (
    <div ref={root} className="fixed inset-0 grid place-items-center overflow-hidden bg-white" style={{ zIndex: "var(--z-loader)" }} role="status" aria-label="Loading">
      <Mandala className="left-1/2 top-1/2 w-[min(120vw,760px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]" seconds={40} />
      <img ref={logo} src={brand.logo} alt={site.brandLine} fetchPriority="high" decoding="async" className="relative w-[min(58vw,420px)] scale-0 object-contain" />
    </div>
  );
}

export function Atmosphere() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const mobile = useIsMobile();

  useGSAP(
    () => {
      if (reduced || !root.current) return;
      // The warm gradient drifts with scroll as a GPU transform on a tall layer (no full-screen repaint per frame).
      if (!mobile)
        gsap.to(root.current.querySelector("[data-burn]"), {
          yPercent: -54.5,
          ease: "none",
          scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: true },
        });
      if (!mobile)
        gsap.utils.toArray<HTMLElement>(root.current.querySelectorAll("[data-ember]")).forEach((ember, i) => {
          gsap.to(ember, { y: `random(-${140 + i * 10}, -${60 + i * 10})`, x: "random(-40, 40)", opacity: "random(0.08, 0.4)", duration: "random(9, 18)", repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.4 });
        });
    },
    { scope: root, dependencies: [reduced, mobile] },
  );

  const embers = Array.from({ length: mobile ? 8 : 22 });
  return (
    <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: "var(--z-background)" }}>
      <div
        data-burn
        className="absolute inset-x-0 top-0 h-[220%] will-change-transform"
        style={{
          backgroundSize: "100% 100%",
          backgroundImage:
            "radial-gradient(120% 60% at 50% 0%, rgba(240,193,75,0.20), transparent 60%), radial-gradient(80% 50% at 12% 28%, rgba(168,121,44,0.18), transparent 64%), radial-gradient(80% 50% at 88% 64%, rgba(143,23,18,0.22), transparent 62%), linear-gradient(180deg, #120a04 0%, #241206 40%, #100805 74%, #070504 100%)",
        }}
      />
      {embers.map((_, i) => (
        <span key={i} data-ember className="absolute rounded-full bg-mukut will-change-transform" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, width: i % 4 === 0 ? 2.5 : 1.5, height: i % 4 === 0 ? 2.5 : 1.5, opacity: 0.18 }} />
      ))}
    </div>
  );
}

const cursorStates: Record<string, gsap.TweenVars> = {
  default: { scale: 1, opacity: 0.9, borderWidth: 1 },
  link: { scale: 1.9, opacity: 0.8, borderWidth: 1 },
  image: { scale: 3.2, opacity: 0.5, borderWidth: 1 },
  portal: { scale: 5.4, opacity: 0.35, borderWidth: 1 },
  cta: { scale: 3.6, opacity: 0.6, borderWidth: 1 },
};

export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const coarse = useCoarsePointer();
  const reduced = useReducedMotion();
  useEffect(() => {
    if (coarse || reduced || !ring.current) return;
    const el = ring.current;
    const move = { x: gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" }), y: gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" }) };
    let state: string | null = null;
    const onMove = (e: PointerEvent) => {
      move.x(e.clientX);
      move.y(e.clientY);
      const target = (e.target as Element | null)?.closest<HTMLElement>("[data-cursor], a, button");
      const next = target?.dataset?.cursor || (target ? "link" : "default");
      if (next !== state) {
        state = next;
        gsap.to(el, { ...(cursorStates[next] || cursorStates.default), duration: 0.4, ease: "power3.out" });
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [coarse, reduced]);
  if (coarse || reduced) return null;
  return <div ref={ring} aria-hidden className="pointer-events-none fixed top-0 left-0 -mt-[7px] -ml-[7px] h-3.5 w-3.5 rounded-full border border-gold mix-blend-difference" style={{ zIndex: "var(--z-cursor)" }} />;
}

const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E")`;

export function Grain() {
  return <div aria-hidden className="pointer-events-none fixed inset-0 hidden opacity-[0.05] sm:block" style={{ zIndex: "var(--z-foreground)", backgroundImage: noise }} />;
}

const nav = [
  { label: "Home", href: "#home" },
  { label: "Gallery", href: "#gallery" },
  { label: "About", href: "#details" },
];

export function Header() {
  const root = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  useGSAP(() => {
    gsap.from(root.current, { opacity: 0, y: -14, duration: 1, delay: 0.6, ease: "power3.out" });
  }, { scope: root });
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      ref={root}
      className={`pointer-events-none fixed top-0 left-0 flex w-full items-center justify-between gap-6 px-5 py-3 transition-colors duration-300 sm:px-9 ${scrolled ? "border-b border-antique/15 bg-obsidian/95" : "border-b border-transparent"}`}
      style={{ zIndex: "var(--z-nav)" }}
    >
      <div className="pointer-events-auto flex shrink-0 items-center gap-1.5 sm:gap-4">
        <a href="#home" aria-label={`${site.brandLine}, home`}>
          <img src={brand.logo} alt={site.brandLine} className={`object-cover transition-all duration-300 ${scrolled ? "h-12 w-19 sm:h-16 sm:w-25" : "h-15 w-24 sm:h-22 sm:w-35"}`} />
        </a>
        <span aria-hidden className={`w-px bg-antique/30 transition-all duration-300 ${scrolled ? "h-4 sm:h-7" : "h-5 sm:h-10"}`} />
        <img src={brand.panchatva} alt={site.organiserName} className={`w-auto object-contain transition-all duration-300 ${scrolled ? "h-5 sm:h-10" : "h-6 sm:h-14"}`} />
      </div>
      <nav className="pointer-events-auto hidden items-center gap-9 md:flex">
        {nav.map(({ label, href }) => (
          <a key={href} href={href} className="inline-flex min-h-11 items-center text-[1.15rem] tracking-[0.14em] text-ivory/70 uppercase transition-colors duration-400 hover:text-mukut">
            {label}
          </a>
        ))}
      </nav>
      <button type="button" id="buy-btn" data-cursor="cta" className="cta-label pointer-events-auto min-h-11 shrink-0 cursor-pointer rounded-full border border-mukut bg-mukut px-5 py-2.5 text-obsidian transition-colors duration-500 hover:border-gold hover:bg-gold">
        Book ticket
      </button>
    </header>
  );
}

export function Backdrop({ scrim = "rgba(7,5,4,0.55)" }: { scrim?: string }) {
  return (
    <>
      <picture aria-hidden className="pointer-events-none absolute inset-0" style={{ zIndex: "var(--z-background)" }}>
        <source media="(min-width: 640px)" srcSet={media.heroBg.webp} type="image/webp" />
        <source media="(min-width: 640px)" srcSet={media.heroBg.file} />
        <source srcSet={media.heroBg.webpMobile} type="image/webp" />
        <img src={media.heroBg.fileMobile} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
      </picture>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ zIndex: "var(--z-atmosphere)", background: scrim }} />
    </>
  );
}

function Instagram({ size = 24, strokeWidth = 2, ...rest }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...rest}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

// The closing page. The ground opens into a mandala laid flat in perspective and lit from its centre, the
// closing couplet rises out of its own mask, and the ways to reach Divi tilt up from the floor.
const GROUND_GLOW =
  "radial-gradient(circle, rgba(255,196,96,0.55) 0%, rgba(242,150,58,0.30) 26%, rgba(143,23,18,0.14) 52%, transparent 74%)";
const FOOT_SCRIM = "linear-gradient(180deg, rgba(7,5,4,0.55) 0%, rgba(7,5,4,0.30) 42%, rgba(7,5,4,0.82) 100%)";

export function Footer() {
  const root = useRef<HTMLElement>(null);
  const contacts = [
    { Icon: Phone, label: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}` },
    { Icon: Mail, label: site.email, href: `mailto:${site.email}` },
    { Icon: Instagram, label: site.instagramHandle, href: site.instagram },
    { Icon: MapPin, label: "Find your way", href: site.maps },
  ];
  const external = (href: string) => (href.startsWith("http") ? { target: "_blank", rel: "noreferrer noopener" } : {});

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const start = "top 72%";

      // The ground mandala rises and opens as the closing page arrives.
      gsap.fromTo(
        q("[data-ground]"),
        { xPercent: -50, yPercent: 38, rotateX: 50, scale: 0.8, opacity: 0.35 },
        { xPercent: -50, yPercent: 22, rotateX: 50, scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: 1 } },
      );

      // Each couplet line lifts out of its own overflow mask.
      gsap.fromTo(
        q("[data-couplet]"),
        { yPercent: 108, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.5, stagger: 0.12, ease: "power4.out", scrollTrigger: { trigger: root.current, start } },
      );
      gsap.fromTo(
        q("[data-rise]"),
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: root.current, start } },
      );
      // The contact cards tip up from the floor rather than simply fading in.
      gsap.fromTo(
        q("[data-card]"),
        { y: 60, rotateX: -34, opacity: 0 },
        { y: 0, rotateX: 0, opacity: 1, duration: 1.1, stagger: 0.09, ease: "power3.out", scrollTrigger: { trigger: q("[data-cards]")[0], start: "top 88%" } },
      );
    },
    { scope: root },
  );

  return (
    <footer ref={root} id="footer" className="relative flex min-h-[115svh] flex-col justify-end overflow-hidden px-5 pt-40 pb-10 sm:px-10" style={{ zIndex: "var(--z-content)" }}>
      <picture aria-hidden className="pointer-events-none absolute inset-0" style={{ zIndex: "var(--z-background)" }}>
        <source media="(min-width: 640px)" srcSet={media.heroBg.webp} type="image/webp" />
        <source media="(min-width: 640px)" srcSet={media.heroBg.file} />
        <source srcSet={media.heroBg.webpMobile} type="image/webp" />
        <img src={media.heroBg.fileMobile} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
      </picture>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ zIndex: "var(--z-atmosphere)", background: "rgba(7,5,4,0.55)" }} />

      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ zIndex: "var(--z-geometry)", perspective: "1200px" }}>
        <div data-ground className="absolute bottom-[-42%] left-1/2 aspect-square w-[min(170vw,1400px)] origin-bottom will-change-transform">
          <div className="absolute inset-0 rounded-full" style={{ background: GROUND_GLOW }} />
          <MandalaArt className="inset-[10%] opacity-70" spin={200} strokeWidth={0.36} />
          <MandalaArt variant="chakra" className="inset-[26%] opacity-60" spin={130} reverse strokeWidth={0.44} />
        </div>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ zIndex: "var(--z-atmosphere)", background: FOOT_SCRIM }} />

      <div className="relative mx-auto w-full max-w-416" style={{ zIndex: "var(--z-content)" }}>
        <p data-rise className="label text-antique">
          <span lang="gu">પરોઢ</span> · Dawn
        </p>
        <h2 className="display-type mt-4 text-[clamp(2.8rem,9vw,8.6rem)] leading-[0.95] text-ivory [text-shadow:0_10px_50px_rgba(0,0,0,0.55)]" style={{ perspective: "1000px" }}>
          {["The Chakra turns", "until the sun returns."].map((line) => (
            <span key={line} className="block overflow-hidden pb-[0.1em]">
              <span data-couplet className="block will-change-transform" style={{ transformOrigin: "50% 100%" }}>
                {line}
              </span>
            </span>
          ))}
        </h2>

        <div data-rise className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-2 text-lg text-ivory/85">
          <span className="text-mukut">{site.dates}</span>
          <span>{site.location}</span>
        </div>

        <div data-rise className="mt-8 flex flex-wrap gap-3">
          <button type="button" data-cursor="cta" onClick={() => document.getElementById("buy-btn")?.click()} className="cta-label min-h-12 cursor-pointer rounded-full border border-mukut bg-mukut px-7 py-3 text-obsidian transition-colors duration-500 hover:border-gold hover:bg-gold">
            Book ticket
          </button>
          <a href={site.maps} target="_blank" rel="noreferrer noopener" className="cta-label inline-flex min-h-12 items-center rounded-full border border-ivory/35 bg-obsidian/40 px-7 py-3 text-ivory transition-colors duration-500 hover:border-mukut hover:text-mukut">
            Get directions
          </a>
        </div>

        <div aria-hidden className="mt-16 h-px bg-[linear-gradient(90deg,transparent,rgba(201,162,74,0.55),transparent)]" />

        <ul data-cards className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" style={{ perspective: "900px" }}>
          {contacts.map(({ Icon, label, href }) => (
            <li key={label} data-card className="origin-bottom will-change-transform">
              <a href={href} {...external(href)} className="flex min-h-14 items-center gap-3 rounded-2xl border border-antique/25 bg-obsidian/65 px-5 py-4 text-ivory/80 transition-colors hover:border-mukut hover:text-ivory">
                <Icon size={18} strokeWidth={1.4} className="shrink-0 text-mukut" aria-hidden />
                <span className="text-sm">{label}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-center text-sm text-ivory/65 sm:flex-row sm:text-left">
          <p>
            {site.brandLine} organised by <span className="text-mukut">{site.organiserName}</span>. All photographs and content owned by {site.brandLine}.
          </p>
          <a href={site.terms} className="label inline-flex min-h-11 items-center rounded-full border border-antique/25 px-4 py-2 text-ivory/70 transition-colors hover:border-antique/60 hover:text-ivory">
            T&amp;Cs
          </a>
        </div>
      </div>
    </footer>
  );
}
