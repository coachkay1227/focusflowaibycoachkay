import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Award, Users, BookOpen } from "lucide-react";
import coachKayImg from "@/assets/coach-kay.jpeg";

const testimonials = [
  {
    name: "Amira J.",
    text: "Coach Kay helped me see patterns I'd been blind to for years. In three sessions, I made more progress than in two years of journaling alone.",
    role: "Entrepreneur",
  },
  {
    name: "David T.",
    text: "She doesn't sugarcoat — and that's exactly what I needed. Direct, warm, and genuinely invested in my growth.",
    role: "Tech Lead",
  },
  {
    name: "Sarah M.",
    text: "The Clarity Session was a turning point. I finally understood why I kept self-sabotaging and got a clear action plan to move forward.",
    role: "Marketing Director",
  },
  {
    name: "Marcus L.",
    text: "I've worked with coaches before, but Coach Kay is different. She sees beneath the surface and asks the questions no one else will.",
    role: "Creative Director",
  },
];

const credentials = [
  { icon: Award, label: "Certified Life & Transformation Coach" },
  { icon: BookOpen, label: "AI-Enhanced Coaching Methodology" },
  { icon: Users, label: "500+ Clients Coached Worldwide" },
  { icon: Star, label: "Specializing in Clarity, Purpose & Alignment" },
];

const CoachKay = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Meet Coach Kay — AI & Life Transformation Coach | FocusFlow AI"
        description="Kenza Alaoui (Coach Kay) is an emotionally intelligent, pattern-aware life coach who blends AI technology with deep human insight to help you find clarity."
        path="/about"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Kenza Alaoui",
          alternateName: "Coach Kay",
          jobTitle: "AI & Life Transformation Coach",
          url: "https://coachkayai.life/about",
          image: "https://coachkayai.life/coach-kay.jpeg",
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Photo */}
            <AnimatedSection>
              <div className="relative mx-auto max-w-sm">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/40 to-accent/20 blur-lg" />
                <img
                  src={coachKayImg}
                  alt="Coach Kay — Kenza Alaoui, AI & Life Transformation Coach"
                  className="relative rounded-2xl object-cover shadow-2xl w-full"
                  loading="eager"
                />
              </div>
            </AnimatedSection>

            {/* Intro */}
            <AnimatedSection>
              <p className="mb-2 font-sans text-sm uppercase tracking-widest text-primary">
                Meet Your Coach
              </p>
              <h1 className="mb-4 font-heading text-4xl font-bold leading-tight md:text-5xl">
                Coach Kay
              </h1>
              <p className="mb-2 text-lg text-muted-foreground">
                Kenza Alaoui — AI &amp; Life Transformation Coach
              </p>
              <p className="mb-6 text-foreground/80 leading-relaxed">
                Warm but direct. Emotionally intelligent. Pattern-aware. Coach Kay
                doesn't sugarcoat, but she never shames. She sees people deeply and
                speaks truth with care — blending cutting-edge AI technology with
                genuine human insight to help you find clarity, alignment, and
                intentional action.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => navigate("/clarity")}
                >
                  Free Clarity Check <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary/30 text-foreground hover:bg-primary/10"
                  onClick={() => navigate("/auth")}
                >
                  Get Started
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Bio */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <AnimatedSection>
            <h2 className="mb-8 text-center font-heading text-3xl font-bold">
              The Story Behind the Mission
            </h2>
            <div className="space-y-5 text-foreground/80 leading-relaxed">
              <p>
                Coach Kay's journey into coaching wasn't born from a textbook — it
                was forged through lived experience. After years of navigating her
                own seasons of uncertainty, burnout, and reinvention, she discovered
                that the most powerful breakthroughs come when someone has the
                courage to name what others won't say.
              </p>
              <p>
                That insight became the foundation of FocusFlow AI — a platform
                where technology amplifies empathy, where AI-driven pattern
                detection meets emotionally intelligent coaching, and where every
                interaction is designed to move you closer to the life you actually
                want.
              </p>
              <p>
                Her approach is simple: balance empathy with accountability. Connect
                emotions to patterns to actions. Use simple, powerful language — no
                jargon, no fluff. Whether you're stuck in a loop, standing at a
                crossroads, or ready to level up, Coach Kay meets you where you are
                and challenges you to go further.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Credentials */}
      <section className="bg-secondary/30 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <AnimatedSection>
            <h2 className="mb-12 text-center font-heading text-3xl font-bold">
              Credentials &amp; Expertise
            </h2>
          </AnimatedSection>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {credentials.map(({ icon: Icon, label }, i) => (
              <AnimatedSection key={label} delay={i * 100}>
                <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center transition-colors hover:border-primary/40">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <AnimatedSection>
            <h2 className="mb-4 text-center font-heading text-3xl font-bold">
              What Clients Say
            </h2>
            <p className="mx-auto mb-12 max-w-xl text-center text-muted-foreground">
              Real stories from people who've worked with Coach Kay to find
              clarity and take action.
            </p>
          </AnimatedSection>
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((t, i) => (
              <AnimatedSection key={t.name} delay={i * 100}>
                <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6">
                  <div className="mb-3 flex gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className="h-4 w-4 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <p className="mb-4 flex-1 text-foreground/80 italic leading-relaxed">
                    "{t.text}"
                  </p>
                  <div>
                    <p className="font-medium text-foreground">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-b from-secondary/30 to-background py-16 md:py-24">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <AnimatedSection>
            <h2 className="mb-4 font-heading text-3xl font-bold">
              Ready to Get Unstuck?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Start with a free Clarity Check — no sign-up required — and see
              what Coach Kay's approach can reveal about where you are and where
              you're headed.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => navigate("/clarity")}
              >
                Free Clarity Check <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/30 text-foreground hover:bg-primary/10"
                onClick={() => navigate("/community")}
              >
                Join the Community
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default CoachKay;
