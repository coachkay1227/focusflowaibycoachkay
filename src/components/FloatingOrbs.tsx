const FloatingOrbs = () => (
  <>
    <div
      className="animate-float-1"
      style={{
        position: "absolute",
        top: "10%",
        left: "5%",
        width: 400,
        height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, hsl(43 75% 52% / 0.08), transparent 70%)",
        filter: "blur(80px)",
        pointerEvents: "none",
        zIndex: 0,
        willChange: "transform",
      }}
    />
    <div
      className="animate-float-2"
      style={{
        position: "absolute",
        top: "50%",
        right: "5%",
        width: 350,
        height: 350,
        borderRadius: "50%",
        background: "radial-gradient(circle, hsl(210 40% 30% / 0.12), transparent 70%)",
        filter: "blur(80px)",
        pointerEvents: "none",
        zIndex: 0,
        willChange: "transform",
      }}
    />
    <div
      className="animate-float-3"
      style={{
        position: "absolute",
        bottom: "10%",
        left: "40%",
        width: 300,
        height: 300,
        borderRadius: "50%",
        background: "radial-gradient(circle, hsl(43 60% 58% / 0.06), transparent 70%)",
        filter: "blur(80px)",
        pointerEvents: "none",
        zIndex: 0,
        willChange: "transform",
      }}
    />
    <div
      className="animate-float-1"
      style={{
        position: "absolute",
        top: "30%",
        left: "60%",
        width: 250,
        height: 250,
        borderRadius: "50%",
        background: "radial-gradient(circle, hsl(210 45% 20% / 0.1), transparent 70%)",
        filter: "blur(80px)",
        pointerEvents: "none",
        zIndex: 0,
        willChange: "transform",
      }}
    />
  </>
);

export default FloatingOrbs;
