import type { ReactNode } from "react";
import { a } from "./content";

// The hero book. The front cover is the Mataji painting on its own, finished as a hardback board: a spine hinge pressed
// into the board, a soft light sheen and worn, shaded edges. Inner pages are cream handmade paper with the photographs and
// reels mounted on them; the back cover is the same board with a blind-pressed rosette. Sizes use container units so every
// page keeps its proportions at any book size.

/** Board finish shared by both covers: edge wear, light sheen and the pressed hinge line beside the spine. */
function Board({ spine }: { spine: "left" | "right" }) {
  const toSpine = spine === "left" ? "90deg" : "270deg";
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 5cqw rgba(15,5,2,0.55), inset 0 0 0.6cqw rgba(15,5,2,0.6)" }} />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(118deg, rgba(255,236,200,0.14), rgba(255,236,200,0.03) 32%, transparent 55%, rgba(10,4,2,0.22))" }} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-[9cqw]"
        style={{ [spine]: 0, background: `linear-gradient(${toSpine}, rgba(8,3,1,0.62), rgba(8,3,1,0.22) 38%, rgba(255,226,170,0.07) 58%, transparent)` }}
      />
      {/* A soft groove where the board bends at the hinge, and a faint bevel catching light along the top edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-[2.2cqw]"
        style={{ [spine]: "4.6cqw", background: `linear-gradient(${toSpine}, transparent, rgba(8,3,1,0.22) 45%, rgba(255,230,185,0.08) 75%, transparent)` }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0.25cqw 0 rgba(255,236,200,0.1), inset 0 -0.35cqw 0 rgba(0,0,0,0.28)" }} />
    </>
  );
}

export function BookCover() {
  return (
    <div className="book-cover relative h-full w-full overflow-hidden bg-maroon [container-type:size]">
      <picture className="contents">
        <source srcSet={a("/assets/cover/mataji.webp")} type="image/webp" />
        <img
          src={a("/assets/cover/mataji.jpg")}
          alt="Maa Durga, painted on aged canvas — the Divi Garba 2026 cover"
          width={900}
          height={1200}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>
      <Board spine="left" />
    </div>
  );
}

export function BookBack() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-maroon [container-type:size]">
      {/* The book closes on Maa Durga astride her lion, printed the way the painting actually is — on parchment,
          filling the board — so the album ends on her rather than on an ornament. */}
      <video src={a("/assets/cover/durga-lion.mp4")} poster={a("/assets/cover/durga-lion.webp")} aria-hidden autoPlay muted loop playsInline preload="none" className="absolute inset-0 h-full w-full object-cover opacity-85" />
      <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(75% 60% at 50% 45%, transparent 40%, rgba(40,14,6,0.55) 100%)" }} />
      <Board spine="right" />
    </div>
  );
}

/** A cream paper page; `mount` sets its content into the page with a margin, held by paper photo corners like an album. */
export function PaperPage({ children, mount = true }: { children?: ReactNode; mount?: boolean }) {
  return (
    <div className="book-paper relative h-full w-full overflow-hidden [container-type:size]" style={{ backgroundColor: "#f2e7d0", backgroundImage: `url(${a("/assets/paper.webp")})`, backgroundSize: "384px" }}>
      {mount && children ? (
        <div className="absolute inset-[6cqw]">
          <div className="absolute inset-0 overflow-hidden bg-obsidian" style={{ boxShadow: "0 0.5cqw 1.4cqw rgba(50,28,8,0.32), 0 0 0 0.3cqw #faf3e3" }}>
            {children}
          </div>
          {PHOTO_CORNERS.map((c) => (
            <span key={c.key} aria-hidden className="pointer-events-none absolute h-[9cqw] w-[9cqw]" style={{ ...c.at, clipPath: c.clip, background: "linear-gradient(135deg, #efe2c3, #dccaa3)", filter: "drop-shadow(0 0.2cqw 0.25cqw rgba(60,35,10,0.4))" }} />
          ))}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

const PHOTO_CORNERS = [
  { key: "tl", at: { top: "-1.2cqw", left: "-1.2cqw" }, clip: "polygon(0 0, 100% 0, 0 100%)" },
  { key: "tr", at: { top: "-1.2cqw", right: "-1.2cqw" }, clip: "polygon(0 0, 100% 0, 100% 100%)" },
  { key: "bl", at: { bottom: "-1.2cqw", left: "-1.2cqw" }, clip: "polygon(0 0, 100% 100%, 0 100%)" },
  { key: "br", at: { bottom: "-1.2cqw", right: "-1.2cqw" }, clip: "polygon(100% 0, 100% 100%, 0 100%)" },
];
