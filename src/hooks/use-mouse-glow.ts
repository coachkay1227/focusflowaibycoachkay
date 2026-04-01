import { useEffect, type RefObject } from "react";

/**
 * Attaches a mousemove listener to the given ref element,
 * setting --mx and --my CSS custom properties for the glow effect.
 */
export function useMouseGlow(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      el.style.setProperty("--mx", e.clientX + "px");
      el.style.setProperty("--my", e.clientY + "px");
    };
    el.addEventListener("mousemove", handler, { passive: true });
    return () => el.removeEventListener("mousemove", handler);
  }, [ref]);
}
