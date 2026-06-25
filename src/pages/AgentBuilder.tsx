import { useState, useRef } from "react";
import { useMouseGlow } from "@/hooks/use-mouse-glow";
import { useNavigate } from "react-router-dom";
import { computeAgentRecommendation, type AgentAnswers } from "@/lib/agent-router";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

// ── Question definitions ──────────────────────────────────────────────────────

const TASK_OPTIONS = [
  { value: 'inbox', label: 'Customer questions & inbox', desc: 'Respond to messages, handle FAQs, route inquiries' },
  { value: 'content', label: 'Content & copywriting', desc: 'Write posts, emails, ads, and brand copy' },
  { value: 'research', label: 'Research & summarizing', desc: 'Gather info, summarize docs, build briefings' },
  { value: 'strategic-thinking', label: 'Strategic thinking & decisions', desc: 'Think through problems, analyze options, plan' },
  { value: 'project-management', label: 'Projects & task tracking', desc: 'Manage tasks, organize workflows, track progress' },
  { value: 'sales-followup', label: 'Sales follow-up & lead nurture', desc: 'Follow up with leads, handle objections, nurture' },
  { value: 'phone-calls', label: 'Phone calls or text conversations', desc: 'Make/receive calls, send SMS, live chat responses' },
];

interface SingleOption { value: string; label: string; desc: string; }

const QUESTIONS = [
  {
    step: 1,
    label: 'STEP 01 — PURPOSE',
    question: 'What do you need your AI agent to handle?',
    subtitle: 'Select all that apply. You can choose more than one.',
    type: 'multi' as const,
    options: TASK_OPTIONS,
  },
  {
    step: 2,
    label: 'STEP 02 — SCALE',
    question: 'How many AI agents are you looking to build?',
    subtitle: 'This determines your pricing tier.',
    type: 'single' as const,
    options: [
      { value: '1', label: 'Just one', desc: 'One focused agent for my biggest bottleneck' },
      { value: '2-3', label: '2 to 3 agents', desc: 'A small team — bundle pricing applies' },
      { value: '4+', label: '4 or more', desc: 'A full agency build — includes branded dashboard' },
    ] as SingleOption[],
  },
  {
    step: 3,
    label: 'STEP 03 — COMMUNICATION',
    question: 'Does your agent need to have real-time human-like conversations?',
    subtitle: 'This determines which platform is right for your use case.',
    type: 'single' as const,
    options: [
      { value: 'yes', label: 'Yes — calls, texts, or live chat', desc: 'Needs to respond instantly like a human assistant' },
      { value: 'no', label: 'No — background or async tasks', desc: 'Runs tasks, responds to messages, works behind the scenes' },
    ] as SingleOption[],
  },
  {
    step: 4,
    label: 'STEP 04 — KNOWLEDGE',
    question: 'Do you have business documents to train it on?',
    subtitle: 'SOPs, brand guides, FAQs, process docs.',
    type: 'single' as const,
    options: [
      { value: 'yes', label: 'Yes — SOPs, guides, brand docs', desc: 'I have materials to give it context about my business' },
      { value: 'no', label: 'Not yet', desc: 'Starting from scratch — we\'ll build the knowledge base together' },
    ] as SingleOption[],
  },
  {
    step: 5,
    label: 'STEP 05 — OWNERSHIP',
    question: 'How do you want to own your agent?',
    subtitle: 'One-time build or ongoing managed plan.',
    type: 'single' as const,
    options: [
      { value: 'own', label: 'I want to own all the files', desc: 'One-time payment — you get everything and self-manage' },
      { value: 'hosted', label: 'Maintain it for me', desc: 'Monthly plan — Coach Kay keeps the API live and updated' },
    ] as SingleOption[],
  },
] as const;

const TOTAL_STEPS = QUESTIONS.length;

// ── Component ─────────────────────────────────────────────────────────────────

const AgentBuilder = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [animState, setAnimState] = useState<'enter' | 'exit' | 'idle'>('enter');

  // Answer state
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [agentCount, setAgentCount] = useState<'' | '1' | '2-3' | '4+'>('');
  const [needsRealtime, setNeedsRealtime] = useState<'' | 'yes' | 'no'>('');
  const [hasDocuments, setHasDocuments] = useState<'' | 'yes' | 'no'>('');
  const [ownershipPref, setOwnershipPref] = useState<'' | 'own' | 'hosted'>('');

  useMouseGlow(containerRef);

  const question = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  const canProceedForStep = (step: number): boolean => {
    if (step === 0) return selectedTasks.length > 0;
    if (step === 1) return agentCount !== '';
    if (step === 2) return needsRealtime !== '';
    if (step === 3) return hasDocuments !== '';
    if (step === 4) return ownershipPref !== '';
    return false;
  };

  const canProceed = canProceedForStep(currentStep);

  const animateToStep = (nextStep: number) => {
    setAnimState('exit');
    setTimeout(() => {
      setCurrentStep(nextStep);
      setAnimState('enter');
    }, 300);
  };

  const goBack = () => {
    if (currentStep === 0) {
      navigate('/agent-builder');
      return;
    }
    animateToStep(currentStep - 1);
  };

  const goNext = () => {
    if (!canProceed) return;
    if (currentStep < TOTAL_STEPS - 1) {
      animateToStep(currentStep + 1);
    } else {
      // Final step — compute and navigate
      const answers: AgentAnswers = {
        tasks: selectedTasks,
        agentCount: agentCount as AgentAnswers['agentCount'],
        needsRealtime: needsRealtime as AgentAnswers['needsRealtime'],
        hasDocuments: hasDocuments as AgentAnswers['hasDocuments'],
        ownershipPref: ownershipPref as AgentAnswers['ownershipPref'],
      };
      const recommendation = computeAgentRecommendation(answers);
      void trackEvent('agent_builder_completed', { path: recommendation.path, tier: recommendation.tier }, 'ai');
      navigate('/agent-result', { state: { answers, recommendation } });
    }
  };

  const selectSingle = (step: number, value: string) => {
    if (step === 1) setAgentCount(value as '1' | '2-3' | '4+');
    if (step === 2) setNeedsRealtime(value as 'yes' | 'no');
    if (step === 3) setHasDocuments(value as 'yes' | 'no');
    if (step === 4) setOwnershipPref(value as 'own' | 'hosted');

    // Auto-advance for single-select (except last step which needs explicit Continue)
    if (step < TOTAL_STEPS - 1) {
      setTimeout(() => animateToStep(step + 1), 350);
    }
  };

  const toggleTask = (value: string) => {
    setSelectedTasks((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const getCurrentSingleValue = (): string => {
    if (currentStep === 1) return agentCount;
    if (currentStep === 2) return needsRealtime;
    if (currentStep === 3) return hasDocuments;
    if (currentStep === 4) return ownershipPref;
    return '';
  };

  return (
    <div ref={containerRef} className="relative min-h-dvh overflow-hidden grain-overlay">
      <SEOHead
        title="Build My Agent — FocusFlow AI"
        description="Take the 5-minute AI agent assessment and get an exact recommendation for what to build, which platform fits your use case, and how much it costs."
        path="/agent-builder"
      />
      <div className="mouse-glow" />
      <FloatingOrbs />

      {/* Header */}
      <div className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="font-heading text-lg font-light">
          <span className="text-primary">Agent</span> Builder
        </div>
        <span className="font-mono-label text-muted-foreground/60">
          {currentStep + 1} / {TOTAL_STEPS}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 px-6 md:px-12">
        <Progress value={progress} className="h-[2px] bg-border" />
      </div>

      {/* Question area */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6">
        <div
          className={`w-full max-w-2xl ${
            animState === 'enter' ? 'animate-question-enter' :
            animState === 'exit' ? 'animate-question-exit' : ''
          }`}
          style={{ willChange: 'transform, opacity' }}
        >
          <h1 className="sr-only">Agent Builder — FocusFlow AI</h1>
          <span className="font-mono-label text-primary/60 tracking-[0.2em]">
            {question.label}
          </span>

          <h2
            className="font-heading text-3xl md:text-4xl lg:text-5xl font-light mt-4 mb-3 leading-tight"
            style={{ textShadow: '0 0 30px hsl(var(--primary) / 0.1)' }}
          >
            {question.question}
          </h2>

          <p className="text-muted-foreground mb-10 text-base">{question.subtitle}</p>

          {/* Multi-select (Q1) */}
          {question.type === 'multi' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {question.options.map((opt) => {
                  const selected = selectedTasks.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleTask(opt.value)}
                      className={`option-card text-left rounded-lg border backdrop-blur-sm p-5 transition-all ${
                        selected
                          ? 'border-primary bg-primary/10 selected'
                          : 'border-border bg-card/30 hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="block text-foreground font-medium">{opt.label}</span>
                          <span className="block text-muted-foreground text-sm mt-1">{opt.desc}</span>
                        </div>
                        {selected && (
                          <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  onClick={goNext}
                  disabled={!canProceed}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Single-select */}
          {question.type === 'single' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {question.options.map((opt) => {
                  const currentVal = getCurrentSingleValue();
                  const selected = currentVal === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => selectSingle(currentStep, opt.value)}
                      className={`option-card text-left rounded-lg border backdrop-blur-sm p-5 transition-all ${
                        selected
                          ? 'border-primary bg-primary/10 selected'
                          : 'border-border bg-card/30 hover:border-primary/40'
                      }`}
                    >
                      <span className="block text-foreground font-medium">{opt.label}</span>
                      <span className="block text-muted-foreground text-sm mt-1">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Show Continue button on last step */}
              {currentStep === TOTAL_STEPS - 1 && (
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={goNext}
                    disabled={!canProceed}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30"
                  >
                    See My Recommendation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentBuilder;
