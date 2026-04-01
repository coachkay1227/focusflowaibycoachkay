import { useState } from "react";
import AnimatedSection from "./AnimatedSection";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

interface DecisionOption {
  label: string;
  description: string;
  outcome: string;
}

interface DecisionModeProps {
  question: string;
  options: DecisionOption[];
  onDecide: (option: DecisionOption) => void;
}

const DecisionMode = ({ question, options, onDecide }: DecisionModeProps) => {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <AnimatedSection className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <span className="font-mono-label text-primary tracking-[0.2em]">Decision Mode</span>
        <h3
          className="font-heading text-xl md:text-2xl font-light mt-3 text-foreground"
          style={{ textShadow: "0 0 20px hsl(43 75% 52% / 0.1)" }}
        >
          {question}
        </h3>
        <p className="text-muted-foreground text-sm mt-2">
          Stop thinking. Choose. The right answer is the one you commit to.
        </p>
      </div>

      <div className="space-y-3">
        {options.map((option, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`option-card w-full text-left rounded-lg border bg-card/30 backdrop-blur-sm p-5 transition-all ${
              selected === i
                ? "selected border-primary/40"
                : "border-border hover:border-primary/20"
            }`}
          >
            <span className="block text-foreground font-medium">{option.label}</span>
            <span className="block text-muted-foreground text-sm mt-1">{option.description}</span>
            {selected === i && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <span className="font-mono-label text-primary/60 text-xs">Likely outcome</span>
                <p className="text-foreground/80 text-sm mt-1">{option.outcome}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {selected !== null && (
        <AnimatedSection className="mt-6 text-center">
          <Button
            onClick={() => onDecide(options[selected])}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            I choose this
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </AnimatedSection>
      )}
    </AnimatedSection>
  );
};

export default DecisionMode;
