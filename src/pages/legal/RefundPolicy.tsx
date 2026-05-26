import LegalLayout from "./LegalLayout";

const RefundPolicy = () => (
  <LegalLayout
    eyebrow="LEGAL · REFUNDS"
    title="Refund & Cancellation Policy"
    description="Refund windows and cancellation terms for FocusFlow AI programs."
    path="/refund-policy"
    lastUpdated="May 26, 2026"
  >
    <p>
      We want every client to feel confident saying yes. Our refund windows are designed to
      protect that — while respecting the fact that coaching delivers value the moment you do the
      work. All refund requests should be sent to{" "}
      <a href="mailto:hello@coachkayai.life" className="text-primary">hello@coachkayai.life</a>.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">Free offerings</h2>
    <p>
      The Clarity Check, AI Coach free tier, Starter Kit, and Community access are free — no
      refund applies.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">Digital products & micro-offers (under $300)</h2>
    <p>
      Refund available within <strong>7 days of purchase</strong> if you have not downloaded the
      full toolkit or completed more than 25% of the module.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">30-Day Personal Reset</h2>
    <p>
      Refund available within <strong>7 days of purchase</strong>, provided your first 1:1 session
      has not yet taken place. After your first session, the program is non-refundable but may be
      paused once for up to 30 days for documented life events.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">90-Day Business Transformation</h2>
    <p>
      Refund available within <strong>7 days of purchase</strong>, provided the kickoff call has
      not yet taken place. After kickoff, the program is non-refundable; a one-time 30-day pause
      is available for documented life events.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">90-Day Full AI Transformation</h2>
    <p>
      Refund available within <strong>7 days of purchase</strong>, provided neither the kickoff
      call nor the Rent-an-Agent custom AI workflow build has begun. Because this program includes
      a bespoke AI build by our team, it becomes <strong>non-refundable once provisioning
      starts</strong>.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">Subscriptions</h2>
    <p>
      You can cancel any subscription from your dashboard or by emailing us. Cancellation stops
      future renewals; we do not pro-rate refunds for the current billing period. The most recent
      charge may be refunded within 7 days of the renewal date if the service was not used.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">Chargebacks</h2>
    <p>
      Please reach out to us first — we genuinely want to make it right. Initiating a chargeback
      before contacting us may result in immediate suspension of access while the dispute is
      reviewed.
    </p>

    <h2 className="font-heading text-2xl font-light text-primary pt-4">How to request a refund</h2>
    <ol className="list-decimal pl-6 space-y-2">
      <li>Email <a href="mailto:hello@coachkayai.life" className="text-primary">hello@coachkayai.life</a> from the email on your account.</li>
      <li>Include your order number and the program name.</li>
      <li>We respond within 3 business days and process approved refunds via Stripe within 5–10 business days.</li>
    </ol>
  </LegalLayout>
);

export default RefundPolicy;