import LegalLayout from "./LegalLayout";

const Terms = () => (
  <LegalLayout
    eyebrow="LEGAL · TERMS"
    title="Terms of Service"
    description="The terms governing your use of FocusFlow AI by Coach Kay."
    path="/terms"
    lastUpdated="May 26, 2026"
  >
    <p>
      These Terms of Service ("Terms") govern your access to and use of FocusFlow AI, including
      coachkayai.life, the Clarity Check, coaching programs, AI tools, and any related services
      (collectively, the "Service"), operated by <strong>Shield Her Elevation LLC</strong>. By
      using the Service you agree to these Terms.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">1. Who we are</h2>
    <p>
      FocusFlow AI is a coaching, education, and AI-productivity platform created by Coach Kay, a
      Master Certified Life Coach. We are <strong>not</strong> a licensed therapist, doctor,
      lawyer, accountant, or financial advisor, and our Service is not a substitute for those
      services.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">2. Accounts</h2>
    <p>
      You must be 18 or older and provide accurate information. You are responsible for activity
      on your account and for keeping your password secure. We may suspend or terminate accounts
      that violate these Terms, abuse the Service, or engage in fraud.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">3. Programs & payments</h2>
    <ul className="list-disc pl-6 space-y-2">
      <li>Prices for programs (e.g. 30-Day Personal Reset, 90-Day Transformation, Full AI 90-Day) are shown at checkout in USD and processed by Stripe.</li>
      <li>One-time purchases grant access to the inclusions listed on the program page.</li>
      <li>Refunds are governed by our <a href="/refund-policy" className="text-primary">Refund Policy</a>.</li>
      <li>Live 1:1 sessions must be scheduled within the program window; missed sessions without 24-hour notice are forfeited.</li>
    </ul>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">4. Acceptable use</h2>
    <p>You agree not to:</p>
    <ul className="list-disc pl-6 space-y-2">
      <li>Resell, redistribute, or share your account or program content without written permission.</li>
      <li>Use the AI Coach to generate harmful, illegal, hateful, or sexually explicit content.</li>
      <li>Scrape, reverse-engineer, or attempt to circumvent rate limits or security controls.</li>
      <li>Use the Service to spam, harass, or impersonate others.</li>
    </ul>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">5. Intellectual property</h2>
    <p>
      All coaching frameworks (including the Clarity Code, F.O.C.U.S. pillars, and program
      curricula), written content, audio, video, code, and branding are the property of Shield
      Her Elevation LLC and protected by copyright. You receive a personal, non-transferable
      license to use them for your own development while your access is active.
    </p>
    <p>
      You retain ownership of the answers and content you submit. By submitting, you grant us a
      limited license to process them in order to deliver the Service and improve our coaching
      experience in aggregate, anonymized form.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">6. AI-generated content</h2>
    <p>
      The AI Coach uses large language models (Google Gemini, OpenAI, and others). AI responses
      can be inaccurate or incomplete. Use your own judgment. The AI is a tool to support your
      coaching journey, not an authoritative source.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">7. Disclaimer of warranties</h2>
    <p>
      The Service is provided "as is" and "as available" without warranties of any kind. We do
      not guarantee specific income, business, health, relationship, or transformation outcomes.
      See our <a href="/disclaimer" className="text-primary">Coaching Disclaimer</a>.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">8. Limitation of liability</h2>
    <p>
      To the maximum extent permitted by law, Shield Her Elevation LLC and Coach Kay shall not be
      liable for any indirect, incidental, special, consequential, or punitive damages. Our total
      liability for any claim is limited to the amount you paid us in the 12 months preceding the
      claim.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">9. Governing law</h2>
    <p>
      These Terms are governed by the laws of the state in which Shield Her Elevation LLC is
      registered, without regard to conflict-of-laws principles. Disputes will be resolved by
      binding arbitration in that jurisdiction, except for small-claims matters and intellectual
      property claims.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">10. Changes</h2>
    <p>
      We may update these Terms. We'll notify you of material changes by email or in-app notice.
      Continued use after the effective date constitutes acceptance.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">11. Contact</h2>
    <p>
      Shield Her Elevation LLC · <a href="mailto:hello@coachkayelevates.org" className="text-primary">hello@coachkayelevates.org</a>
    </p>
  </LegalLayout>
);

export default Terms;