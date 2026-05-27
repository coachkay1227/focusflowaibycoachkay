import { useEffect, useRef, useState } from "react";

/**
 * MirrorReveal — Phase 4 "wow moment" on /truth.
 * Pure CSS + IntersectionObserver. No libraries.
 * Scroll-triggers a typewriter reveal of a single signature line,
 * then a soft cascade of supporting copy.
 */
const LINE =
  "You came here for the truth. Here it is: AI won't replace you. But the version of you that ignores it… will be replaced by the version that doesn't.";

export default function MirrorReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setArmed(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!armed) return;
    // Respect reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(LINE);
      return;
    }
    let i = 0;
    const interval = window.setInterval(() => {
      i += 1;
      setTyped(LINE.slice(0, i));
      if (i >= LINE.length) window.clearInterval(interval);
    }, 22);
    return () => window.clearInterval(interval);
  }, [armed]);

  const done = typed.length === LINE.length;

  return (
    <section
      ref={ref}
      aria-label="The mirror"
      className="relative my-12 md:my-16 overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-[hsl(210_40%_5%)] via-[hsl(210_45%_7%)] to-[hsl(210_40%_4%)] px-6 py-12 md:px-12 md:py-16"
    >
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] rounded-full bg-primary/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(hsl(43_75%_52%)_1px,transparent_1px)] [background-size:24px_24px]" />

      <p className="relative text-[10px] tracking-[0.28em] uppercase text-primary font-medium mb-6">
        The Mirror
      </p>

      <p
        className="relative font-heading italic text-[1.5rem] md:text-[2.25rem] leading-[1.25] text-foreground/95 max-w-3xl min-h-[6.5rem] md:min-h-[8rem]"
        aria-live="polite"
      >
        {typed}
        <span
          aria-hidden
          className={`inline-block w-[2px] h-[1em] align-[-0.15em] ml-1 bg-primary ${
            done ? "animate-pulse" : ""
          }`}
        />
      </p>

      <div
        className={`relative mt-8 grid sm:grid-cols-3 gap-3 transition-all duration-700 ${
          done ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        {[
          { k: "Look at what's true", v: "Not what's loud." },
          { k: "Build with intention", v: "Not with fear." },
          { k: "Move before you're ready", v: "Clarity comes from motion." },
        ].map((c) => (
          <div
            key={c.k}
            className="rounded-xl border border-primary/15 bg-primary/[0.04] px-5 py-4"
          >
            <p className="text-[10px] tracking-[0.2em] uppercase text-primary/80 mb-1">
              {c.k}
            </p>
            <p className="text-sm text-foreground/85 leading-snug">{c.v}</p>
          </div>
        ))}
      </div>
    </section>
  );
}