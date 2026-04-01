import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { saveUserPreferences, enrollInModule } from "@/lib/enrollment-store";
import { coachingModules } from "@/lib/modules";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Sparkles, Check } from "lucide-react";

const goals = [
  { value: "clarity", label: "Clarity", desc: "Cut through confusion and see what's real" },
  { value: "emotional-health", label: "Emotional Health", desc: "Process what I'm carrying and reset" },
  { value: "focus", label: "Focus", desc: "Stop scattering and start finishing" },
  { value: "purpose", label: "Purpose & Meaning", desc: "Reconnect with what actually matters" },
];

const styles = [
  { value: "supportive", label: "Supportive", desc: "Warm, empathetic, encouraging" },
  { value: "direct", label: "Direct", desc: "Honest, no sugarcoating, cut to it" },
  { value: "reflective", label: "Reflective", desc: "Deep questions, space to think" },
  { value: "strategic", label: "Strategic", desc: "Action-oriented, structured, clear" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("");
  const [style, setStyle] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      el.style.setProperty("--mx", e.clientX + "px");
      el.style.setProperty("--my", e.clientY + "px");
    };
    el.addEventListener("mousemove", handler, { passive: true });
    return () => el.removeEventListener("mousemove", handler);
  }, []);

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    setSaving(true);
    await saveUserPreferences({
      primaryGoal: goal,
      coachingStyle: style,
      selectedModules,
    });
    // Auto-enroll in selected modules
    await Promise.all(selectedModules.map((id) => enrollInModule(id)));
    setSaving(false);
    navigate("/dashboard");
  };

  const canProceed =
    (step === 0 && goal) ||
    (step === 1 && style) ||
    (step === 2 && selectedModules.length > 0);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden grain-overlay flex items-center justify-center px-6">
      <FloatingOrbs />
      <div className="mouse-glow" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Progress */}
        <div className="flex justify-center gap-2 mb-12">
          {[0, 1, 2].map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-500 ${
                s <= step ? "bg-primary w-12" : "bg-border w-8"
              }`}
            />
          ))}
        </div>

        {/* Step 0: Goal */}
        {step === 0 && (
          <AnimatedSection className="text-center">
            <span className="font-mono-label text-primary tracking-[0.2em]">Step 1 of 3</span>
            <h1
              className="font-heading text-3xl md:text-5xl font-light mt-4 mb-3"
              style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.15)" }}
            >
              What brought you here?
            </h1>
            <p className="text-muted-foreground mb-10">Choose the area that resonates most right now.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {goals.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  className={`option-card text-left rounded-lg border p-6 transition-all ${
                    goal === g.value ? "selected" : "border-border bg-card/30"
                  }`}
                >
                  <h3 className="font-heading text-lg font-light mb-1">{g.label}</h3>
                  <p className="text-muted-foreground text-sm">{g.desc}</p>
                </button>
              ))}
            </div>
          </AnimatedSection>
        )}

        {/* Step 1: Style */}
        {step === 1 && (
          <AnimatedSection className="text-center">
            <span className="font-mono-label text-primary tracking-[0.2em]">Step 2 of 3</span>
            <h1
              className="font-heading text-3xl md:text-5xl font-light mt-4 mb-3"
              style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.15)" }}
            >
              How do you like to be coached?
            </h1>
            <p className="text-muted-foreground mb-10">This shapes how Coach Kay speaks to you.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {styles.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  className={`option-card text-left rounded-lg border p-6 transition-all ${
                    style === s.value ? "selected" : "border-border bg-card/30"
                  }`}
                >
                  <h3 className="font-heading text-lg font-light mb-1">{s.label}</h3>
                  <p className="text-muted-foreground text-sm">{s.desc}</p>
                </button>
              ))}
            </div>
          </AnimatedSection>
        )}

        {/* Step 2: Modules */}
        {step === 2 && (
          <AnimatedSection className="text-center">
            <span className="font-mono-label text-primary tracking-[0.2em]">Step 3 of 3</span>
            <h1
              className="font-heading text-3xl md:text-5xl font-light mt-4 mb-3"
              style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.15)" }}
            >
              Pick your starting modules
            </h1>
            <p className="text-muted-foreground mb-10">Select one or more. You can always add more later.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {coachingModules.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => toggleModule(mod.id)}
                  className={`option-card text-left rounded-lg border p-6 transition-all relative ${
                    selectedModules.includes(mod.id) ? "selected" : "border-border bg-card/30"
                  }`}
                >
                  {selectedModules.includes(mod.id) && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                  )}
                  <h3 className="font-heading text-lg font-light mb-1">{mod.title}</h3>
                  <p className="text-primary/80 text-xs mb-1">{mod.subtitle}</p>
                  <p className="text-muted-foreground text-sm">{mod.description}</p>
                </button>
              ))}
            </div>
          </AnimatedSection>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
              Skip for now
            </Button>
          )}

          {step < 2 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed}
              className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30"
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canProceed || saving}
              className="animate-pulse-glow bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30"
            >
              {saving ? "Setting up..." : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Launch My Journey
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
