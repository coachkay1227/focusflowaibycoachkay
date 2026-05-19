import { useEffect, useRef, type RefObject } from "react";

/**
 * Attaches a mousemove listener to the given ref element,
 * setting --mx and --my CSS custom properties for the glow effect.
 * Throttled with requestAnimationFrame so updates happen at most once per frame.
 */
export function useMouseGlow(ref: RefObject<HTMLElement | null>) {
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handler = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
      rafId.current = requestAnimationFrame(() => {
        el.style.setProperty("--mx", x + "px");
        el.style.setProperty("--my", y + "px");
        rafId.current = null;
      });
    };

    el.addEventListener("mousemove", handler, { passive: true });
    return () => {
      el.removeEventListener("mousemove", handler);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [ref]);
}
