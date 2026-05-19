import { useIsMobile } from "@/hooks/use-mobile";

const orbConfigs = [
  {
    className: "animate-float-1",
    top: "10%", left: "5%", size: 600,
    bg: "radial-gradient(circle, hsl(43 75% 52% / 0.16), transparent 70%)",
  },
  {
    className: "animate-float-2",
    top: "50%", right: "5%", size: 550,
    bg: "radial-gradient(circle, hsl(210 40% 30% / 0.18), transparent 70%)",
  },
  {
    className: "animate-float-3",
    bottom: "10%", left: "40%", size: 500,
    bg: "radial-gradient(circle, hsl(43 60% 58% / 0.14), transparent 70%)",
  },
  {
    className: "animate-float-1",
    top: "30%", left: "60%", size: 400,
    bg: "radial-gradient(circle, hsl(210 45% 20% / 0.15), transparent 70%)",
  },
];

const FloatingOrbs = () => {
  const isMobile = useIsMobile();
  const visibleOrbs = isMobile ? orbConfigs.slice(0, 2) : orbConfigs;
  const blur = isMobile ? "blur(40px)" : "blur(80px)";

  return (
    <>
      {visibleOrbs.map((orb, i) => (
        <div
          key={i}
          className={orb.className}
          style={{
            position: "absolute",
            top: orb.top,
            left: orb.left,
            right: orb.right,
            bottom: orb.bottom,
            width: isMobile ? orb.size * 0.6 : orb.size,
            height: isMobile ? orb.size * 0.6 : orb.size,
            borderRadius: "50%",
            background: orb.bg,
            filter: blur,
            pointerEvents: "none",
            zIndex: 0,
            willChange: "transform",
          }}
        />
      ))}
    </>
  );
};

export default FloatingOrbs;
