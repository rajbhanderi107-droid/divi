import { useId, useMemo, useRef } from "react";
import { gsap, useGSAP, useOffscreenHide, useReducedMotion } from "./hooks";

// Hand-drawn style mandala line art in a gold gradient, in the spirit of the Divi mandala and Gujarati temple work:
// double-outlined petals with an echo and a vein, overlapping lotus layers, temple arches, woven lattice bands,
// interlaced stars, bead rings and fine ticks. Drawn as SVG so it stays crisp at any size; the gradient rotates with the
// mandala, so it shimmers as it turns.

export type MandalaVariant = "lotus" | "chakra" | "medallion";

const TAU = Math.PI * 2;
const f = (v: number) => v.toFixed(2);
const at = (radius: number, angle: number) => [Math.cos(angle) * radius, Math.sin(angle) * radius] as const;
const angleOf = (i: number, n: number, offset = 0) => ((i + offset) / n) * TAU - Math.PI / 2;

/** One pointed petal from r0 (base) to r (tip), half-width w at its belly. */
function petalPath(a: number, r0: number, r: number, w: number) {
  const rm = r0 + (r - r0) * 0.48;
  const half = w / Math.max(rm, 1) / 2;
  const [bx, by] = at(r0, a);
  const [tx, ty] = at(r, a);
  const [lx, ly] = at(rm, a - half * 1.9);
  const [rx, ry] = at(rm, a + half * 1.9);
  return `M${f(bx)} ${f(by)}Q${f(lx)} ${f(ly)} ${f(tx)} ${f(ty)}Q${f(rx)} ${f(ry)} ${f(bx)} ${f(by)}`;
}

/** A ring of petals, each with an inner echo outline and a centre vein. */
function echoPetals(r: number, n: number, len: number, w: number, offset = 0) {
  let outer = "";
  let inner = "";
  for (let i = 0; i < n; i++) {
    const a = angleOf(i, n, offset);
    outer += petalPath(a, r - len, r, w);
    inner += petalPath(a, r - len * 0.86, r - len * 0.2, w * 0.5);
    const [vx0, vy0] = at(r - len * 0.8, a);
    const [vx1, vy1] = at(r - len * 0.34, a);
    inner += `M${f(vx0)} ${f(vy0)}L${f(vx1)} ${f(vy1)}`;
  }
  return { outer, inner };
}

/** Temple arches (mehrab) standing on a ring, each with an inner arch and a finial bead. */
function arches(r: number, n: number, height: number) {
  let d = "";
  const beads: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a0 = angleOf(i, n);
    const a1 = angleOf(i + 1, n);
    const am = (a0 + a1) / 2;
    const [x0, y0] = at(r, a0);
    const [x1, y1] = at(r, a1);
    const [cx, cy] = at(r + height * 1.6, am);
    d += `M${f(x0)} ${f(y0)}Q${f(cx)} ${f(cy)} ${f(x1)} ${f(y1)}`;
    const [ix0, iy0] = at(r, a0 + (a1 - a0) * 0.22);
    const [ix1, iy1] = at(r, a1 - (a1 - a0) * 0.22);
    const [icx, icy] = at(r + height * 0.95, am);
    d += `M${f(ix0)} ${f(iy0)}Q${f(icx)} ${f(icy)} ${f(ix1)} ${f(iy1)}`;
    beads.push(at(r + height * 0.95, am) as [number, number]);
  }
  return { d, beads };
}

/** A woven band: curves crossing each other between two radii. */
function lattice(r0: number, r1: number, n: number) {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = angleOf(i, n);
    const step = TAU / n;
    for (const dir of [1, -1]) {
      const [x0, y0] = at(r0, a);
      const [x1, y1] = at(r1, a + dir * step);
      const [cx, cy] = at((r0 + r1) / 2, a + dir * step * 0.62);
      d += `M${f(x0)} ${f(y0)}Q${f(cx)} ${f(cy)} ${f(x1)} ${f(y1)}`;
    }
  }
  return d;
}

/** An interlaced star polygon {n/k}. */
function star(r: number, n: number, k: number) {
  let d = "";
  for (let i = 0; i < n; i++) {
    const [x0, y0] = at(r, angleOf(i, n));
    const [x1, y1] = at(r, angleOf(i + k, n));
    d += `M${f(x0)} ${f(y0)}L${f(x1)} ${f(y1)}`;
  }
  return d;
}

function scallops(r: number, n: number, depth: number) {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a0 = angleOf(i, n);
    const a1 = angleOf(i + 1, n);
    const [x0, y0] = at(r, a0);
    const [x1, y1] = at(r, a1);
    const [cx, cy] = at(r + depth, (a0 + a1) / 2);
    d += `${i ? "" : `M${f(x0)} ${f(y0)}`}Q${f(cx)} ${f(cy)} ${f(x1)} ${f(y1)}`;
  }
  return d;
}

function ticks(r0: number, r1: number, n: number, offset = 0) {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = angleOf(i, n, offset);
    const [x0, y0] = at(r0, a);
    const [x1, y1] = at(r1, a);
    d += `M${f(x0)} ${f(y0)}L${f(x1)} ${f(y1)}`;
  }
  return d;
}

function beadRing(r: number, n: number, big: number, small: number, key: string) {
  return Array.from({ length: n }, (_, i) => {
    const [x, y] = at(r, angleOf(i, n));
    return <circle key={`${key}-${i}`} cx={f(x)} cy={f(y)} r={i % 2 ? small : big} />;
  });
}

function drawing(variant: MandalaVariant, w: number) {
  const bold = w * 1.9;
  const fine = w * 0.6;
  if (variant === "chakra") {
    const outerPetals = echoPetals(84, 36, 12, 5.6);
    const heart = echoPetals(22, 8, 16, 9, 0.5);
    return (
      <>
        <g strokeWidth={fine}>
          <path d={ticks(92, 97, 144)} />
          <path d={lattice(46, 62, 24)} />
          <path d={heart.inner} />
          <path d={outerPetals.inner} />
        </g>
        <g strokeWidth={bold}>
          <circle r={90} />
          <circle r={70} />
          <circle r={64} />
          <circle r={25} />
        </g>
        <g strokeWidth={w}>
          <circle r={88} />
          <path d={outerPetals.outer} />
          <path d={ticks(26, 44, 24)} />
          <circle r={45} />
          <path d={star(44, 12, 5)} />
          <path d={heart.outer} />
          <circle r={4} />
        </g>
        <g fill="currentColor" stroke="none">
          {beadRing(67, 48, 0.95, 0.55, "b1")}
          {beadRing(44, 24, 1.1, 1.1, "b2")}
          <circle r={1.8} />
        </g>
      </>
    );
  }
  if (variant === "medallion") {
    const outer = echoPetals(80, 16, 32, 20);
    const inner = echoPetals(50, 8, 30, 22, 0.5);
    return (
      <>
        <g strokeWidth={bold}>
          <path d={scallops(88, 24, 8)} />
          <circle r={20} />
        </g>
        <g strokeWidth={w}>
          <path d={outer.outer} />
          <path d={inner.outer} />
          <circle r={9} />
        </g>
        <g strokeWidth={fine}>
          <path d={outer.inner} />
          <path d={inner.inner} />
        </g>
        <g fill="currentColor" stroke="none">
          {beadRing(84, 24, 1.8, 1.8, "m")}
          <circle r={4} />
        </g>
      </>
    );
  }
  const arch = arches(80, 32, 6);
  const lotusA = echoPetals(64, 24, 16, 9);
  const lotusB = echoPetals(60, 24, 12, 7, 0.5);
  const heart = echoPetals(26, 12, 14, 8, 0.5);
  const seed = echoPetals(11, 8, 8, 5);
  return (
    <>
      <g strokeWidth={bold}>
        <circle r={80} />
        <circle r={49} />
        <circle r={27} />
      </g>
      <g strokeWidth={w}>
        <path d={scallops(96, 64, 2.4)} />
        <path d={arch.d} />
        <path d={lotusA.outer} />
        <path d={lotusB.outer} />
        <circle r={46} />
        <path d={star(45, 16, 7)} />
        <path d={heart.outer} />
        <path d={seed.outer} />
      </g>
      <g strokeWidth={fine}>
        <circle r={93} />
        <path d={ticks(80, 84, 128, 0.5)} />
        <path d={lattice(66, 78, 32)} />
        <path d={lotusA.inner} />
        <path d={lotusB.inner} />
        <path d={heart.inner} />
      </g>
      <g fill="currentColor" stroke="none">
        {arch.beads.map(([x, y], i) => (
          <circle key={`a-${i}`} cx={f(x)} cy={f(y)} r={0.9} />
        ))}
        {beadRing(88.5, 64, 0.8, 0.45, "l1")}
        {beadRing(47.5, 48, 0.7, 0.4, "l2")}
        <circle r={2.2} />
      </g>
    </>
  );
}

/**
 * A mandala placed absolutely by `className` (position and size). It always turns in a slow loop (`spin` seconds per
 * turn, `reverse` for the other direction); `turn` adds extra rotation as its section scrolls past.
 */
export function MandalaArt({ className = "", variant = "lotus", turn, spin = variant === "chakra" ? 150 : 200, reverse = false, strokeWidth = 0.4, style }: { className?: string; variant?: MandalaVariant; turn?: number; spin?: number; reverse?: boolean; strokeWidth?: number; style?: React.CSSProperties }) {
  const svg = useRef<SVGSVGElement>(null);
  const holder = useOffscreenHide<HTMLDivElement>();
  const reduced = useReducedMotion();
  const gradient = `mandala-gold-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  useGSAP(
    () => {
      if (reduced || !turn || !svg.current) return;
      gsap.fromTo(svg.current, { rotation: 0 }, { rotation: turn, ease: "none", transformOrigin: "50% 50%", scrollTrigger: { trigger: svg.current.parentElement, start: "top bottom", end: "bottom top", scrub: 1.2 } });
    },
    { dependencies: [reduced, turn] },
  );
  const art = useMemo(() => drawing(variant, strokeWidth), [variant, strokeWidth]);
  return (
    <div ref={holder} aria-hidden className={`pointer-events-none absolute ${className}`} style={{ zIndex: "var(--z-geometry)", ...style }}>
      <svg
        ref={svg}
        viewBox="-100 -100 200 200"
        className={`h-full w-full will-change-transform ${spin ? "mandala-spin" : ""}`}
        style={{ color: "#dcb65f", ...(spin ? { animationDuration: `${spin}s`, animationDirection: reverse ? "reverse" : "normal" } : {}) }}
        fill="none"
        stroke={`url(#${gradient})`}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <defs>
          <linearGradient id={gradient} x1="-100" y1="-100" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#8a6a2e" />
            <stop offset="0.35" stopColor="#c9a24a" />
            <stop offset="0.5" stopColor="#f6d37a" />
            <stop offset="0.65" stopColor="#c9a24a" />
            <stop offset="1" stopColor="#7a5a26" />
          </linearGradient>
        </defs>
        <g fill="none">{art}</g>
      </svg>
    </div>
  );
}

/** A small rosette for carved dividers: eight double-outlined petals around a bead. */
export function Rosette({ className = "h-5 w-5 text-mukut/80" }: { className?: string }) {
  const d = useMemo(() => {
    const p = echoPetals(9.4, 8, 7.4, 4.6);
    return { outer: p.outer, inner: p.inner, tips: ticks(9.2, 9.9, 8, 0.5) };
  }, []);
  return (
    <svg aria-hidden viewBox="-10 -10 20 20" className={`shrink-0 ${className}`} fill="none" stroke="currentColor" strokeLinejoin="round" strokeLinecap="round">
      <path d={d.outer} strokeWidth={0.8} />
      <path d={d.inner} strokeWidth={0.45} />
      <path d={d.tips} strokeWidth={0.6} />
      <circle r={1.7} fill="currentColor" stroke="none" />
    </svg>
  );
}
