import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { type Program, FOCUS_PILLARS } from "@/data/programs";
import OfferCard from "@/components/offers/OfferCard";
import { startProgramCheckout, PENDING_CHECKOUT_KEY } from "@/lib/start-program-checkout";
import { useToast } from "@/hooks/use-toast";

interface ProgramCardProps {
  program: Program;
  enrollment?: { status: string } | null;
  onEnroll?: (programId: string) => void;
  enrolling?: boolean;
}

const statusLabels: Record<string, string> = {
  enrolled: "Enrolled",
  in_progress: "In Progress",
  completed: "Completed",
};

export default function ProgramCard({ program, enrollment, onEnroll, enrolling }: ProgramCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [buying, setBuying] = useState(false);
  const pillar = FOCUS_PILLARS[program.pillar];

  const canStart = program.type === "assessment";
  const detailsPath = `/programs/${program.slug}`;
  const startPath = `/clarity/${program.id}`;

  // Eyebrow stays compact so it never wraps to 2 lines on narrow cards.
  const eyebrow = `${pillar.full} · ${program.category}`;

  // Badge precedence: enrollment status > New > Featured
  let badge: string | undefined;
  if (enrollment) badge = statusLabels[enrollment.status] ?? enrollment.status;
  else if (program.isNew) badge = "New";
  else if (program.isFeatured) badge = "Featured";

  // Primary CTA = the next funnel step. Secondary CTA = always "View details"
  // so the geometry is identical across every card on the grid.
  let primaryCta: { label: string; onClick: () => void; to?: string };

  if (enrollment) {
    primaryCta = {
      label: enrollment.status === "completed" ? "Review program" : "Continue program",
      onClick: () => navigate(detailsPath),
    };
  } else if (program.stripePriceId) {
    const label = buying
      ? "Opening checkout…"
      : user
        ? `Buy now — ${program.priceDisplay}`
        : `Sign in to buy — ${program.priceDisplay}`;
    primaryCta = {
      label,
      onClick: async () => {
        if (!user) {
          try { sessionStorage.setItem(PENDING_CHECKOUT_KEY, program.stripePriceId!); } catch { /* noop */ }
          navigate(`/auth?next=${encodeURIComponent("/modules")}`);
          return;
        }
        setBuying(true);
        try {
          await startProgramCheckout(program.stripePriceId!, {
            title: program.title,
            price: program.price,
          });
        } catch (e) {
          toast({
            title: "Couldn't start checkout",
            description: e instanceof Error ? e.message : "Please try again.",
            variant: "destructive",
          });
          setBuying(false);
        }
      },
    };
  } else if (program.isGated) {
    primaryCta = {
      label: program.cohortCode ? "Enter cohort code" : "Apply for access",
      onClick: () => navigate(detailsPath),
    };
  } else if (canStart) {
    primaryCta = {
      label: "Start assessment",
      onClick: () => navigate(startPath),
    };
  } else if (!user) {
    primaryCta = {
      label: "Sign in to enroll",
      onClick: () =>
        navigate(`/auth?next=${encodeURIComponent(detailsPath)}`),
    };
  } else if (onEnroll) {
    primaryCta = {
      label: enrolling ? "Enrolling…" : "Enroll now",
      onClick: () => onEnroll(program.id),
    };
  } else {
    primaryCta = {
      label: "View details",
      onClick: () => navigate(detailsPath),
    };
  }

  // Secondary always routes to the same detail page so users have one
  // consistent "learn more" affordance in the same slot on every card.
  const secondaryCta =
    primaryCta.label === "View details"
      ? undefined
      : { label: "View details", onClick: () => navigate(detailsPath) };

  return (
    <OfferCard
      eyebrow={eyebrow}
      badge={badge}
      title={program.title}
      tagline={program.tagline}
      features={program.tags.slice(0, 4)}
      price={program.priceDisplay}
      priceSuffix={program.durationLabel}
      primaryCta={primaryCta}
      secondaryCta={secondaryCta}
      variant={program.isFeatured ? "featured" : "standard"}
    />
  );
}
