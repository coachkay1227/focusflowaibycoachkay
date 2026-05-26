import LegalLayout from "./LegalLayout";
import SEOHead from "@/components/SEOHead";

const Privacy = () => (
  <>
    <SEOHead
      title="Privacy Policy — FocusFlow AI"
      description="How FocusFlow AI by Coach Kay collects, uses, and protects your information."
      path="/privacy"
    />
  <LegalLayout
    eyebrow="LEGAL · PRIVACY"
    title="Privacy Policy"
    description="How FocusFlow AI by Coach Kay collects, uses, and protects your information."
    path="/privacy"
    lastUpdated="May 26, 2026"
  >
    <p>
      FocusFlow AI ("we", "us", "our") is a coaching and AI-productivity service operated by{" "}
      <strong>Shield Her Elevation LLC</strong>. This Privacy Policy explains what we collect when
      you use coachkayai.life, our Clarity Check, our programs, and our AI tools.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">1. What we collect</h2>
    <ul className="list-disc pl-6 space-y-2">
      <li><strong>Account information:</strong> name, email, password (hashed, never stored in plain text), and optional profile details.</li>
      <li><strong>Clarity Check answers:</strong> the responses you submit so we can generate your personalized insight.</li>
      <li><strong>Payment information:</strong> handled entirely by Stripe — we never see or store your card number.</li>
      <li><strong>Usage data:</strong> pages viewed, features used, device/browser metadata, and analytics events.</li>
      <li><strong>Communications:</strong> emails you send us and our coaching/email replies.</li>
    </ul>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">2. How we use it</h2>
    <ul className="list-disc pl-6 space-y-2">
      <li>To deliver your Clarity Code, programs, AI Coach responses, and digital products you purchased.</li>
      <li>To send transactional emails (results, receipts, welcome sequences, password resets).</li>
      <li>To improve our coaching content, prompts, and product experience.</li>
      <li>To comply with legal obligations and prevent fraud or abuse.</li>
      <li>With your opt-in consent, to send occasional marketing — you can unsubscribe at any time.</li>
    </ul>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">3. Who we share it with</h2>
    <p>
      We do not sell your data. We share only with service providers we need to run the platform:
    </p>
    <ul className="list-disc pl-6 space-y-2">
      <li><strong>Lovable Cloud:</strong> our managed backend for database, authentication, and file storage.</li>
      <li><strong>Stripe:</strong> payment processing.</li>
      <li><strong>Resend:</strong> transactional email delivery.</li>
      <li><strong>Google (Gemini) / OpenAI via Lovable AI Gateway:</strong> generating your AI coaching responses.</li>
      <li><strong>GoHighLevel:</strong> coaching CRM and scheduling.</li>
    </ul>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">4. Cookies & tracking</h2>
    <p>
      We use essential cookies (to keep you signed in) and lightweight analytics to understand
      product usage. You can clear cookies in your browser at any time. We do not use cross-site
      advertising trackers.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">5. Your rights</h2>
    <p>
      You may request a copy of your data, correction of inaccuracies, or deletion of your account
      at any time. Residents of the EU/UK (GDPR), California (CCPA), and other privacy
      jurisdictions have additional rights including the right to object to processing and the
      right to data portability. Email <a href="mailto:hello@coachkayelevates.org" className="text-primary">hello@coachkayelevates.org</a> and we will respond within 30 days.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">6. Data retention</h2>
    <p>
      We keep account data for as long as your account is active, and Clarity Check / coaching
      records for up to 24 months after your last interaction unless you request earlier deletion.
      Financial records are kept for 7 years for tax and accounting compliance.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">7. Children</h2>
    <p>
      FocusFlow AI is intended for adults 18+. We do not knowingly collect information from
      children under 13 (under 16 in the EU).
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">8. Changes</h2>
    <p>
      We may update this policy. Material changes will be announced by email or an in-app notice.
      Continued use after the effective date means you accept the updated policy.
    </p>
  </LegalLayout>
);

export default Privacy;