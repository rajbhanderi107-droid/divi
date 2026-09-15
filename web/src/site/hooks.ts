import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, useGSAP };

export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  const get = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, get, () => false);
}

export const useIsMobile = () => useMediaQuery("(max-width: 768px)");
export const useCoarsePointer = () => useMediaQuery("(hover: none), (pointer: coarse)");
// Animations stay on for every device, whatever the system reduce-motion setting says (the organiser's decision).
export const useReducedMotion = () => false;

/**
 * For decorative layers (mandalas): while the element is well off screen the browser skips drawing it. Its spin keeps
 * running the whole time, so it is already turning when it scrolls back into view.
 */
export function useOffscreenHide<T extends HTMLElement | SVGElement>(margin = "250px") {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        el.style.visibility = entry.isIntersecting ? "" : "hidden";
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return ref;
}

/** The page shown for the current hash: "terms", "privacy-choices", or the site ("top" and section anchors). */
export function useHashRoute() {
  const read = () => window.location.hash.replace("#", "") || "top";
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onHash = () => {
      const next = read();
      setRoute(next);
      requestAnimationFrame(() => {
        const target = document.getElementById(next);
        if (target) target.scrollIntoView();
        else window.scrollTo({ top: 0 });
      });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}
