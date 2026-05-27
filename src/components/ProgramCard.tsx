import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { type Program, FOCUS_PILLARS } from "@/data/programs";
import OfferCard from "@/components/offers/OfferCard";

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
  const pillar = FOCUS_PILLARS[program.pillar];

  const canStart = program.type === "assessment";

  // Eyebrow combines pillar + category for fast scanning
  const eyebrow = `${program.pillar} · ${pillar.name} · ${program.category}`;

  // Badge precedence: enrollment status > New > Featured
  let badge: string | undefined;
  if (enrollment) badge = statusLabels[enrollment.status] ?? enrollment.status;
  else if (program.isNew) badge = "New";
  else if (program.isFeatured) badge = "Featured";

  // Primary CTA always opens the program detail page
  const primaryCta = {
    label: "View details",
    onClick: () => navigate(`/programs/${program.slug}`),
  };

  // Secondary CTA reflects gating + auth + enrollment state
  let secondaryCta;
  if (program.isGated) {
    secondaryCta = {
      label: program.cohortCode ? "Code required" : "Application required",
      onClick: () => navigate(`/programs/${program.slug}`),
    };
  } else if (canStart) {
    secondaryCta = {
      label: "Start now",
      onClick: () => navigate(`/clarity/${program.id}`),
    };
  } else if (user && !enrollment && onEnroll) {
    secondaryCta = {
      label: enrolling ? "Enrolling…" : "Enroll",
      onClick: () => onEnroll(program.id),
    };
  } else if (!user) {
    secondaryCta = {
      label: "Sign in to enroll",
      onClick: () => navigate("/auth"),
    };
  }

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
