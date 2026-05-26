import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, BookOpen, Users } from "lucide-react";
import type { AccessTier } from "@/hooks/use-access-level";

const BOOKING_URL =
  "https://call.coachkayelevates.org/widget/booking/T9DLwsDPEI4rfRHDdhjp";
const COMMUNITY_URL = "https://www.skool.com/focusflow-elevation-hub";

type ProgramCopy = {
  tag: string;
  title: string;
  blurb: string;
  includes: string[];
  primary?: { label: string; href: string; external?: boolean };
};

const PROGRAMS: Partial<Record<AccessTier, ProgramCopy>> = {
  reset_30: {
    tag: "30-Day Reset — Active",
    title: "Your 30-Day Reset",
    blurb:
      "You're in a focused 30-day track designed to give you clarity, momentum, and one win per day. Complete one session daily and join the community for accountability.",
    includes: [
      "Daily clarity session + prompt (30 days)",
      "Access to all foundation modules in the F.O.C.U.S. catalog",
      "FocusFlow Elevation Hub community access",
      "Email check-ins on days 1, 7, 14, and 30",
    ],
    primary: { label: "Join the community", href: COMMUNITY_URL, external: true },
  },
  transformation_90: {
    tag: "90-Day Transformation — Active",
    title: "Your 90-Day Transformation",
    blurb:
      "You're enrolled in a private 90-day coaching container with Coach Kay. Book your first 1:1 session below — it's how we set your plan.",
    includes: [
      "Three 60-minute 1:1 sessions with Coach Kay",
      "Full access to F.O.C.U.S. modules + daily clarity sessions",
      "Weekly accountability check-ins",
      "FocusFlow Elevation Hub community access",
    ],
    primary: { label: "Book your 1:1 session", href: BOOKING_URL, external: true },
  },
};

export default function YourProgramPanel({ tier }: { tier: AccessTier }) {
  const program = PROGRAMS[tier];
  if (!program) return null;

  return (
    <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/30 to-card/10 backdrop-blur-sm p-6 md:p-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <span className="font-mono-label text-primary tracking-[0.18em] text-xs uppercase">
            {program.tag}
          </span>
          <h2 className="font-heading text-2xl md:text-3xl font-light mt-2 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            {program.title}
          </h2>
        </div>
        {program.primary && (
          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <a
              href={program.primary.href}
              target={program.primary.external ? "_blank" : undefined}
              rel={program.primary.external ? "noopener noreferrer" : undefined}
            >
              {tier === "transformation_90" ? <Calendar className="h-4 w-4 mr-2" /> : <Users className="h-4 w-4 mr-2" />}
              {program.primary.label}
            </a>
          </Button>
        )}
      </div>
      <p className="text-muted-foreground mt-4 leading-relaxed">{program.blurb}</p>
      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        {program.includes.map((item) => (
          <div key={item} className="flex items-start gap-2 text-sm text-foreground/80">
            <BookOpen className="h-4 w-4 text-primary/70 mt-0.5 shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}