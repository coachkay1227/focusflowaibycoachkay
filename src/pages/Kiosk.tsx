import { useState, useEffect } from "react";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";
import QRCodeDisplay from "@/components/QRCodeDisplay";

const TESTIMONIALS = [
  {
    quote: "Coach Kay showed me I didn't need another system — I needed focus. Week two, the noise was gone.",
    name: "Sheila — Cohort Member, Reset 30",
  },
  {
    quote: "The Clarity Check named the pattern I'd been dancing around for years — in one paragraph.",
    name: "Starr — Transformation 90",
  },
  {
    quote: "She walked me through AI like a friend, not a manual. Three weeks in, I owned the workflow.",
    name: "Buzz — AI Simplified Track",
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
    <div className="relative min-h-dvh overflow-hidden grain-overlay flex flex-col items-center justify-center px-8 pt-20 pb-16 cursor-default select-none">
      <SEOHead
        title="FocusFlow Clarity Kiosk — Scan to Begin"
        description="In-person FocusFlow AI kiosk experience. Scan the QR code to start a free 5-minute clarity check with Coach Kay and enter the 30-Day Coaching Drawing."
        path="/kiosk"
        noIndex
      />
      <FloatingOrbs />

      {/* Brand */}
      <div className="z-10 absolute top-8 left-8">
        <div className="font-heading text-xl font-light tracking-wide text-foreground" role="img" aria-label="FocusFlow">
          <span aria-hidden="true" className="text-primary font-medium">Focus</span><span aria-hidden="true" className="text-foreground font-light">Flow</span>
          <span className="text-muted-foreground/40 text-sm ml-2">by Coach Kay</span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl">
        {/* Reflective headline */}
        <h1
          className="font-heading text-4xl md:text-6xl lg:text-7xl font-light leading-tight mb-6"
          style={{ textShadow: "0 0 40px hsl(var(--primary) / 0.15)" }}
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
