import LegalLayout from "./LegalLayout";

const Disclaimer = () => (
  <LegalLayout
    eyebrow="LEGAL · DISCLAIMER"
    title="Coaching, Wellness & Earnings Disclaimer"
    description="Important context about what FocusFlow AI by Coach Kay is — and what it isn't."
    path="/disclaimer"
    lastUpdated="May 26, 2026"
  >
    <p>
      Coach Kay is a <strong>Master Certified Life Coach</strong>. FocusFlow AI is a coaching,
      education, and AI-productivity platform. Please read the following carefully — by using the
      Service you acknowledge and agree to these statements.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">Not a medical or mental-health service</h2>
    <p>
      Coaching is <strong>not</strong> therapy, psychotherapy, counseling, psychiatric treatment,
      or any form of medical care. Nothing in the Clarity Check, AI Coach, programs, emails, or
      live sessions is intended to diagnose, treat, cure, or prevent any mental or physical
      condition. If you are in crisis or experiencing a mental-health emergency, please contact
      <strong> 988 (US Suicide & Crisis Lifeline)</strong> or your local emergency number
      immediately.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">Not legal, financial, or tax advice</h2>
    <p>
      Business, AI-transformation, and partnership content is for educational purposes only. It
      is not legal, accounting, tax, or investment advice. Consult a licensed professional in
      your jurisdiction before making legal, financial, or tax decisions.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">Results vary — no guarantees</h2>
    <p>
      Personal-development outcomes depend on your honesty, consistency, and life circumstances.
      Business and income outcomes depend on your effort, your market, your offer, and many
      factors outside our control. <strong>We do not guarantee any specific result, income, ROI,
      relationship outcome, or transformation.</strong> Any case studies, testimonials, or
      example numbers reflect individual experiences and are not typical.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">AI limitations</h2>
    <p>
      The AI Coach and Clarity Insight engine use third-party large language models. Outputs may
      be incomplete, inaccurate, or out of date. Always apply your own judgment, and verify
      anything that matters before acting on it.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">Your responsibility</h2>
    <p>
      You are responsible for the decisions you make based on what you learn here. By
      participating in the Clarity Check, programs, challenges, or coaching, you accept full
      responsibility for your choices, actions, and outcomes.
    </p>

    <p className="text-sm text-muted-foreground/70 pt-4">
      Questions? Email{" "}
      <a href="mailto:hello@coachkayelevates.org" className="text-primary">hello@coachkayelevates.org</a>.
    </p>
  </LegalLayout>
);

export default Disclaimer;