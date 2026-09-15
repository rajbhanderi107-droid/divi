import { media } from "./content";
import { useOffscreenHide } from "./hooks";

// The Divi mandala (the same line art the hero rotates), turning very slowly as a quiet accent.
export function Mandala({ className = "", seconds = 160, reverse = false, style }: { className?: string; seconds?: number; reverse?: boolean; style?: React.CSSProperties }) {
  const ref = useOffscreenHide<HTMLImageElement>();
  return (
    <picture className="contents">
      <source srcSet={media.vector.webp} type="image/webp" />
      <img
        ref={ref}
        src={media.vector.file}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className={`mandala-spin pointer-events-none absolute select-none ${className}`}
        style={{ animationDuration: `${seconds}s`, animationDirection: reverse ? "reverse" : "normal", ...style }}
      />
    </picture>
  );
}
