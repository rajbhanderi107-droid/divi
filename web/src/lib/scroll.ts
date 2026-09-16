import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/site/hooks";

// Smooth scrolling, carried back across from divigarba.vercel.app. Lenis eases the wheel so the page has
// weight, which is what the pinned chapters and the turning ring are choreographed against. Touch is left
// native — syncing it costs a frame on mid-range Android and gains nothing a finger can feel.
//
// Lenis drives ScrollTrigger rather than the other way round: GSAP's ticker steps Lenis, Lenis reports its
// eased position to ScrollTrigger, so pins and scrubs read the same number the page is actually drawn at.
//
// This lives outside the component tree so `lockScroll` can reach the instance without prop-drilling a ref
// through the whole site, and so shell.tsx keeps exporting only components (Fast Refresh needs that).
let lenis: Lenis | null = null;

/**
 * Hold the page still while a full-screen layer is open (the loader, the lightbox). Locking `body` alone is
 * not enough once Lenis owns the scroll — it keeps running against a frozen document and the page jumps back
 * when the layer closes, so the instance has to be stopped too.
 */
export function lockScroll(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
  document.body.style.overflow = locked ? "hidden" : "";
}

/** Start Lenis and wire it to ScrollTrigger. Returns the teardown. */
export function startSmoothScroll() {
  const instance = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.6 });
  lenis = instance;

  const onScroll = () => ScrollTrigger.update();
  instance.on("scroll", onScroll);

  const step = (time: number) => instance.raf(time * 1000);
  gsap.ticker.add(step);
  // ScrollTrigger and Lenis both want to own the frame; letting GSAP drop frames it thinks are late makes
  // the eased position stutter, so lag smoothing goes off.
  gsap.ticker.lagSmoothing(0);

  const refresh = () => ScrollTrigger.refresh();
  document.fonts?.ready.then(refresh);
  window.addEventListener("load", refresh);

  return () => {
    window.removeEventListener("load", refresh);
    gsap.ticker.remove(step);
    gsap.ticker.lagSmoothing(500, 33);
    instance.off("scroll", onScroll);
    instance.destroy();
    if (lenis === instance) lenis = null;
    document.body.style.overflow = "";
  };
}
