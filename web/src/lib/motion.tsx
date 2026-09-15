import * as React from "react";
import { MotionConfig } from "motion/react";

// Site-wide motion preference. Motion plays by default (the site is built around it); the toggle pauses every animation and
// film, and the choice is remembered. Paused state adds `motion-paused` to <html> so CSS animations freeze in place.
type MotionState = { paused: boolean; toggle: () => void };

const MotionContext = React.createContext<MotionState>({ paused: false, toggle: () => {} });
const KEY = "divi-motion";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [paused, setPaused] = React.useState(() => {
    try {
      return localStorage.getItem(KEY) === "paused";
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    document.documentElement.classList.toggle("motion-paused", paused);
    document.documentElement.classList.toggle("motion-on", !paused);
    // The vanilla 3D scene (sculpture.js) reads this class to keep animating under an OS reduced-motion setting.
    document.documentElement.classList.toggle("motion-enabled", !paused);
  }, [paused]);

  const toggle = React.useCallback(() => {
    setPaused((value) => {
      const next = !value;
      try {
        localStorage.setItem(KEY, next ? "paused" : "playing");
      } catch {
        /* storage unavailable: keep the in-memory choice */
      }
      return next;
    });
  }, []);

  return (
    <MotionContext.Provider value={{ paused, toggle }}>
      <MotionConfig reducedMotion={paused ? "always" : "never"}>{children}</MotionConfig>
    </MotionContext.Provider>
  );
}

export const useMotion = () => React.useContext(MotionContext);

/** True while the element is on screen (with a margin), for pausing off-screen work. */
export function useInView<T extends Element>(rootMargin = "120px") {
  const ref = React.useRef<T>(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);
  return [ref, inView] as const;
}
