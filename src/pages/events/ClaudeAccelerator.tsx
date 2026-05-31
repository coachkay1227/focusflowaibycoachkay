import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";

const eventImage = "/images/event-june-4-2026.jpg";

const EVENTBRITE_URL = "https://TheClaudeAIBusinessAccelerator.eventbrite.com";

const eventSchema = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "The Claude AI Business Accelerator",
  description:
    "Free, in-person AI training for Columbus small business owners. Open to all with emphasis on Black entrepreneurs. Build real AI workflows for salons, real estate, coaching, and notary businesses.",
  startDate: "2026-06-04T18:00:00-04:00",
  endDate: "2026-06-04T21:00:00-04:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: {
    "@type": "Place",
    name: "COED Columbus",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1890 E. Main Street",
      addressLocality: "Columbus",
      addressRegion: "OH",
      postalCode: "43205",
      addressCountry: "US",
    },
  },
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    validFrom: "2026-05-01T00:00:00-04:00",
    url: EVENTBRITE_URL,
  },
  organizer: {
    "@type": "Organization",
    name: "FocusFlow AI — Coach Kay",
    url: EVENTBRITE_URL,
  },
  performer: {
    "@type": "Person",
    name: "Coach Kay",
    jobTitle: "AI Business Strategist",
  },
  image: [
    "https://coachkayai.life/images/event-june-4-2026.jpg",
    "https://coachkayai.life/og-image.png",
  ],
  url: EVENTBRITE_URL,
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Register for the Free AI Business Accelerator",
  description:
    "3 simple steps to reserve your seat at the June 4, 2026 event in Columbus.",
  totalTime: "PT2M",
  estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Visit the Eventbrite page",
      text: "Go to TheClaudeAIBusinessAccelerator.eventbrite.com",
      url: EVENTBRITE_URL,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Reserve your free seat",
      text: "Click Register and complete the free ticket form.",
      url: EVENTBRITE_URL,
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Show up June 4, 2026",
      text: "Arrive at COED Columbus, 1890 E. Main Street, by 6:00 PM with your laptop.",
      url: EVENTBRITE_URL,
    },
  ],
};

const faqs = [
  {
    q: "Is this only for Black entrepreneurs?",
    a: "No — open to all Columbus small business owners. We emphasize Black entrepreneurship because these tools close gaps where support has been lightest.",
  },
  {
    q: "What should I bring?",
    a: "Your laptop and a list of your most time-consuming tasks. We'll build live workflows tailored to your actual business.",
  },
  {
    q: "Will this be recorded?",
    a: "Yes — all registered attendees get lifetime access to the recording, templates, and AI prompt library within 24 hours.",
  },
];

export default function ClaudeAccelerator() {
  return (
    <>
      <SEOHead
        title="The Claude AI Business Accelerator — Free Columbus Event"
        description="Free in-person AI training for Columbus small business owners — June 4, 2026 at COED Columbus. Build real AI workflows for salons, real estate, coaching, and notary businesses."
        path="/events/claude-accelerator"
        ogImage="https://coachkayai.life/images/event-june-4-2026.jpg"
        jsonLd={[eventSchema, howToSchema]}
      />

      <article className="min-h-screen bg-background text-foreground">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <img
            src={eventImage}
            alt=""
            width={1536}
            height={896}
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          <div className="relative mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Free Event · Columbus, Ohio
            </p>
            <h1 className="font-serif text-4xl leading-tight sm:text-6xl">
              The Claude AI Business Accelerator
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              A free, in-person workshop for Columbus small business owners.
              Build real AI workflows for your salon, real estate, coaching, or
              notary business — in one evening.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4">
              <Button asChild size="lg">
                <a href={EVENTBRITE_URL} target="_blank" rel="noopener noreferrer">
                  Register Free on Eventbrite →
                </a>
              </Button>
              <p className="text-sm text-muted-foreground">
                June 4, 2026 · 6:00 – 9:00 PM · COED Columbus
              </p>
            </div>
          </div>
        </section>

        {/* Details */}
        <section className="mx-auto max-w-4xl px-6 py-20">
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-serif text-2xl">When</h2>
              <p className="mt-2 text-muted-foreground">
                Thursday, June 4, 2026
                <br />
                6:00 PM – 9:00 PM ET
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-serif text-2xl">Where</h2>
              <p className="mt-2 text-muted-foreground">
                COED Columbus
                <br />
                1890 E. Main Street, Columbus, OH 43205
              </p>
            </div>
          </div>
        </section>

        {/* What you'll build */}
        <section className="border-y border-border bg-card/40 py-20">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-center font-serif text-3xl sm:text-4xl">
              What you'll walk out with
            </h2>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2">
              {[
                "A working AI workflow tailored to your business",
                "Claude prompt library for daily operations",
                "Templates for client intake, follow-up, and content",
                "Lifetime access to the recording and resources",
              ].map((item) => (
                <li
                  key={item}
                  className="rounded-lg border border-border bg-background/40 p-5 text-foreground"
                >
                  <span className="mr-2 text-primary">✦</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="text-center font-serif text-3xl sm:text-4xl">
            Common Questions
          </h2>
          <div className="mt-10 space-y-4">
            {faqs.map(({ q, a }) => (
              <details
                key={q}
                className="rounded-lg border border-border bg-card p-6"
              >
                <summary className="cursor-pointer font-medium">{q}</summary>
                <p className="mt-3 text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border bg-card/40 py-20">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="font-serif text-4xl">Only 150 seats. Free.</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join Columbus small business owners replacing 10+ hours of busywork
              with AI automation.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <a href={EVENTBRITE_URL} target="_blank" rel="noopener noreferrer">
                  Register Free on Eventbrite →
                </a>
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                June 4, 2026 · 6:00 – 9:00 PM · COED Columbus
              </p>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}