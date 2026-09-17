import { useEffect, useRef, useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { brand, media, site } from "./content";
import { gsap, ScrollTrigger, useCoarsePointer, useGSAP, useIsMobile, useReducedMotion } from "./hooks";
import { Mandala } from "./mandala";
import { MandalaArt, Rosette } from "./mandala-art";

// Native scrolling, as on apple.com: no scroll hijacking or inertia layer, so the page follows the trackpad and finger
// exactly and ScrollTrigger reads the real position. Triggers re-measure once fonts and images have loaded.
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);
  return <>{children}</>;
}

export function Loader({ onDone }: { onDone?: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const logo = useRef<HTMLImageElement>(null);
  const [done, setDone] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (done) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
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
      // The warmth deliberately does not drift with scroll: on a layer behind the whole page, drifting means each
      // section arrives at a different tint and reads as a page of its own. The embers carry the motion instead.
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
      {/* The same venue photograph sits fixed behind every section (rather than each section stretching its own
          copy to its own height), so the ground the page stands on never restarts at a section boundary. */}
      <picture className="contents">
        <source media="(min-width: 640px)" srcSet={media.heroBg.webp} type="image/webp" />
        <source media="(min-width: 640px)" srcSet={media.heroBg.file} />
        <source srcSet={media.heroBg.webpMobile} type="image/webp" />
        <img src={media.heroBg.fileMobile} alt="" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      </picture>
      {/* One flat scrim, not a top-to-bottom ramp: a ramp on a layer this tall means each section lands on a
          different part of it and reads as its own page. The warmth on top is soft and wide enough to drift
          without banding. */}
      <div
        data-burn
        className="absolute inset-0"
        style={{
          backgroundSize: "100% 100%",
          backgroundColor: "rgba(30,16,6,0.82)",
          backgroundImage:
            "radial-gradient(120% 60% at 50% 0%, rgba(240,193,75,0.12), transparent 62%), radial-gradient(90% 55% at 12% 30%, rgba(168,121,44,0.10), transparent 66%), radial-gradient(90% 55% at 88% 66%, rgba(143,23,18,0.12), transparent 64%)",
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

function Instagram({ size = 24, strokeWidth = 2, ...rest }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...rest}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function Footer() {
  const contacts = [
    { Icon: Phone, label: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}` },
    { Icon: Mail, label: site.email, href: `mailto:${site.email}` },
    { Icon: Instagram, label: site.instagramHandle, href: site.instagram },
    { Icon: MapPin, label: "Find your way", href: site.maps },
  ];
  const external = (href: string) => (href.startsWith("http") ? { target: "_blank", rel: "noreferrer noopener" } : {});
  return (
    <footer id="footer" className="relative overflow-x-clip px-5 pt-10 pb-10 sm:px-10" style={{ zIndex: "var(--z-content)" }}>
      <div aria-hidden className="bg-jaali jaali-fade pointer-events-none absolute inset-0 opacity-[0.06]" style={{ zIndex: "var(--z-atmosphere)" }} />
      <MandalaArt className="-bottom-[min(62vw,520px)] left-1/2 h-[min(124vw,1040px)] w-[min(124vw,1040px)] -translate-x-1/2 text-antique opacity-[0.24]" turn={70} />
      <div className="divider-carved relative mb-10" style={{ zIndex: "var(--z-content)" }}>
        <Rosette />
      </div>
      <div className="relative mx-auto max-w-5xl" style={{ zIndex: "var(--z-content)" }}>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {contacts.map(({ Icon, label, href }) => (
            <li key={label} className="frame-ancient bg-maroon/25">
              <a href={href} {...external(href)} className="flex flex-col items-center gap-2 px-4 py-5 text-ivory/60 transition-colors hover:text-ivory">
                <Icon size={16} strokeWidth={1.2} className="text-antique" aria-hidden />
                <span className="text-sm">{label}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href={site.terms} className="label inline-flex min-h-11 items-center rounded-full border border-antique/20 px-4 py-2 text-ivory/60 transition-colors hover:border-antique/50 hover:text-ivory">
            T&amp;Cs
          </a>
        </div>
        <p className="mt-8 text-center text-sm text-ivory/70">
          {site.brandLine.split(" ").slice(0, 2).join(" ")} organised by <span className="text-mukut">{site.organiserName}</span>.
        </p>
        <p className="mt-3 text-center text-sm text-ivory/70">All photographs and content owned by {site.brandLine}.</p>
      </div>
    </footer>
  );
}
