import { useState, useEffect } from "react";
import FloatingOrbs from "@/components/FloatingOrbs";
import QRCodeDisplay from "@/components/QRCodeDisplay";

const TESTIMONIALS = [
  {
    quote: "This 5-minute session showed me a pattern I'd been blind to for years.",
    name: "Aisha M.",
  },
  {
    quote: "The Mirror Challenge rewired how I start my mornings. I'm not the same person I was a week ago.",
    name: "David R.",
  },
  {
    quote: "Coach Kay's voice in the results felt like someone who actually sees me.",
    name: "Priya S.",
  },
];

const Kiosk = () => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % TESTIMONIALS.length);
        setFade(true);
      }, 500);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const current = TESTIMONIALS[quoteIndex];

  return (
    <div className="relative min-h-screen overflow-hidden grain-overlay flex flex-col items-center justify-center px-8 cursor-default select-none">
      <FloatingOrbs />

      {/* Brand */}
      <div className="z-10 absolute top-8 left-8">
        <div className="font-heading text-xl font-light tracking-wide text-foreground">
          <span className="text-primary">Focus</span>Flow
          <span className="text-muted-foreground/40 text-sm ml-2">by Coach Kay</span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl">
        {/* Reflective headline */}
        <h1
          className="font-heading text-4xl md:text-6xl lg:text-7xl font-light leading-tight mb-6"
          style={{ textShadow: "0 0 40px hsl(43 75% 52% / 0.15)" }}
        >
          What would you change
          <br />
          <span className="text-primary">if you had total clarity?</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground mb-12">
          Scan the code. 5 minutes. Free.
        </p>

        {/* QR Code */}
        <QRCodeDisplay size={220} label="SCAN TO START" />

        {/* Drawing callout */}
        <div className="mt-10 px-6 py-3 rounded-full border border-primary/20 bg-card/20 backdrop-blur-sm">
          <p className="text-sm text-foreground/70">
            Complete the Clarity Check to enter the{" "}
            <span className="text-primary font-medium">30-Day Coaching Drawing</span>
          </p>
        </div>

        {/* Rotating testimonial */}
        <div
          className="mt-12 max-w-lg transition-opacity duration-500"
          style={{ opacity: fade ? 1 : 0 }}
        >
          <p className="text-foreground/60 text-sm italic leading-relaxed">
            "{current.quote}"
          </p>
          <p className="text-muted-foreground/40 text-xs mt-2 font-mono-label">
            — {current.name}
          </p>
        </div>
      </div>

      {/* Credential line */}
      <div className="z-10 absolute bottom-8 left-0 right-0 text-center">
        <p className="text-xs text-muted-foreground/30 font-mono-label tracking-wider">
          Master Certified Life Coach · 600+ Hours
        </p>
      </div>
    </div>
  );
};

export default Kiosk;
