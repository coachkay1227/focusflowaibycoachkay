// Consent verification view for the audit intake flow.
//
// Buyers see, in plain language, exactly which channels they just agreed to
// before they pay. Texting is optional, so this panel also lets them turn it
// on or off here without walking back through the form. The same masking
// helper backs the admin consent column, so what an admin audits later reads
// the same way the buyer confirmed it.

export function maskPhone(phone: string | null | undefined): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length < 4) return ", ";
  return `••• ••• ${digits.slice(-4)}`;
}

interface ConsentVerificationProps {
  email: string;
  phone: string;
  smsConsent: boolean;
  onChangeConsent: (next: boolean) => void;
  /** Sends the buyer back to the step that holds the contact fields. */
  onEditContact: () => void;
}

export function ConsentVerification({
  email,
  phone,
  smsConsent,
  onChangeConsent,
  onEditContact,
}: ConsentVerificationProps) {
  const trimmedPhone = phone.trim();
  // Consent without a number is not consent to anything, so it never counts.
  const effectiveConsent = smsConsent && trimmedPhone.length > 0;

  return (
    <section
      aria-labelledby="consent-verification-heading"
      className="rounded-lg border border-border/60 bg-card/30 p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 id="consent-verification-heading" className="font-heading text-lg text-foreground">
          Confirm how we reach you
        </h3>
        <button
          type="button"
          onClick={onEditContact}
          className="text-xs text-primary underline underline-offset-4 shrink-0"
        >
          Edit contact info
        </button>
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex flex-wrap items-baseline gap-2">
          <dt className="text-muted-foreground w-28 shrink-0">Email</dt>
          <dd className="text-foreground break-all">{email.trim() || "Not provided yet"}</dd>
        </div>
        <div className="flex flex-wrap items-baseline gap-2">
          <dt className="text-muted-foreground w-28 shrink-0">Mobile</dt>
          <dd className="text-foreground">
            {trimmedPhone ? maskPhone(trimmedPhone) : "Not provided"}
          </dd>
        </div>
        <div className="flex flex-wrap items-baseline gap-2">
          <dt className="text-muted-foreground w-28 shrink-0">Text updates</dt>
          <dd>
            <span
              className={
                effectiveConsent
                  ? "rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs text-primary"
                  : "rounded-md border border-border bg-muted/20 px-2 py-0.5 text-xs text-muted-foreground"
              }
            >
              {effectiveConsent ? "Opted in" : "Email only"}
            </span>
          </dd>
        </div>
      </dl>

      <label className="mt-4 flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
          checked={smsConsent}
          onChange={(e) => onChangeConsent(e.target.checked)}
        />
        <span>
          Yes, text me when my audit is ready and for my follow-up steps. Message rates may
          apply. Reply STOP any time.
        </span>
      </label>

      {smsConsent && !trimmedPhone && (
        <p className="mt-3 text-xs text-primary">
          Add a mobile number above and we can text you. Without one, everything comes by email.
        </p>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        Your audit and receipt always come by email. Texting is optional and never required to
        buy. We record the date and time of your choice so you can see it later.
      </p>
    </section>
  );
}

export default ConsentVerification;