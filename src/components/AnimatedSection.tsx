import { useEffect, useRef, useState, forwardRef } from "react";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  staggerChildren?: boolean;
  delay?: number;
}

const AnimatedSection = forwardRef<HTMLDivElement, AnimatedSectionProps>(
  ({ children, className = "", staggerChildren = false, delay = 0 }, forwardedRef) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [transitionDone, setTransitionDone] = useState(false);

    // Merge forwarded ref with internal ref
    const setRefs = (node: HTMLDivElement | null) => {
      (internalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

    useEffect(() => {
      const el = internalRef.current;
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => setVisible(true), delay);
            observer.unobserve(el);
          }
        },
        { threshold: 0.15 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }, [delay]);

    return (
      <div
        ref={setRefs}
        className={className}
        onTransitionEnd={() => { if (visible) setTransitionDone(true); }}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
          willChange: transitionDone ? "auto" : "transform, opacity",
        }}
      >
        {staggerChildren
          ? Array.isArray(children)
            ? children.map((child, i) => (
                <div
                  key={i}
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(20px)",
                    transition: `opacity 0.5s ease-out ${i * 0.12}s, transform 0.5s ease-out ${i * 0.12}s`,
                  }}
                >
                  {child}
                </div>
              ))
            : children
          : children}
      </div>
    );
  }
);

AnimatedSection.displayName = "AnimatedSection";

export default AnimatedSection;
