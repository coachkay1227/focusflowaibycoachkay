// src/pages/events/ClaudeAccelerator.tsx

import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";

// ─── EVENT SCHEMA ─── The special note for Google
const eventSchema = {
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "The Claude AI Business Accelerator",
  "description": "Free, in-person AI training for Columbus small business owners. Open to all with emphasis on Black entrepreneurs. Build real AI workflows for salons, real estate, coaching, and notary businesses.",
  "startDate": "2026-06-04T18:00:00-04:00",
  "endDate": "2026-06-04T21:00:00-04:00",
  "eventStatus": "https://schema.org/EventCompleted",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "name": "COED Columbus",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "1890 E. Main Street",
      "addressLocality": "Columbus",
      "addressRegion": "OH",
      "postalCode": "43205",
      "addressCountry": "US"
    }
  },
  "isAccessibleForFree": true,
  "organizer": {
    "@type": "Organization",
    "name": "Coach Kay Elevates",
    "url": "https://coachkayai.life"
  },
  "performer": {
    "@type": "Person",
    "name": "Coach Kay",
    "jobTitle": "AI Business Strategist"
  },
  "image": [
    "https://coachkayai.life/images/event-june-4-2026.jpg",
    "https://coachkayai.life/og-image.png"
  ],
  "url": "https://coachkayai.life/events/claude-ai-business-accelerator-june-2026"
};

// ─── FAQ SCHEMA ─── Common questions
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is this event only for Black entrepreneurs?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. The Claude AI Business Accelerator is open to all Columbus small business owners. We place special emphasis on Black entrepreneurship because these tools close the automation gap fastest where support has been lightest."
      }
    },
    {
      "@type": "Question",
      "name": "What should I bring to the event?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bring your laptop and a list of your most time-consuming business tasks. We'll build live AI workflows tailored to your actual work."
      }
    },
    {
      "@type": "Question",
      "name": "Will this be recorded if I can't attend live?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "This event has concluded. Explore Coach Kay's current programs and resources for the latest training options."
      }
    }
  ]
};

// ─── COURSE SCHEMA ─── Educational positioning
const courseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "The Claude AI Business Accelerator",
  "description": "Free hands-on training to build AI workflows for your small business",
  "provider": {
    "@type": "Organization",
    "name": "Coach Kay Elevates",
    "sameAs": "https://coachkayai.life"
  },
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "onsite",
    "instructor": {
      "@type": "Person",
      "name": "Coach Kay"
    },
    "startDate": "2026-06-04T18:00:00-04:00",
    "endDate": "2026-06-04T21:00:00-04:00",
    "location": {
      "@type": "Place",
      "name": "COED Columbus",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "1890 E. Main Street",
        "addressLocality": "Columbus",
        "addressRegion": "OH",
        "postalCode": "43205"
      }
    }
  }
};

// ─── COMBINE ALL SCHEMAS ───
const allSchemas = [eventSchema, faqSchema, courseSchema];

// ═══════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════

export default function ClaudeAcceleratorPage() {
  return (
    <>
      {/* HIDDEN SEO HEAD. Google reads this */}
      <SEOHead
        title="Claude AI Business Accelerator: Event Archive"
        description="Archive of Coach Kay's June 2026 Claude AI Business Accelerator for Columbus small business owners. Explore current AI programs and resources."
        path="/events/claude-ai-business-accelerator-june-2026"
        ogImage="https://coachkayai.life/images/event-june-4-2026.jpg"
        keywords={[
          "Claude AI business accelerator",
          "AI training Columbus Ohio",
          "small business AI workshop",
          "free AI class Columbus",
          "Coach Kay AI event",
          "AI automation for entrepreneurs",
        ]}
        jsonLd={allSchemas}
      />

      {/* ═════════════════════════════════════════════════ */}
      {/* WHAT USERS SEE */}
      {/* ═════════════════════════════════════════════════ */}

      <main className="min-h-screen bg-background text-foreground">
        
        {/* ─── HERO SECTION ─── */}
        <section className="relative py-20 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block px-4 py-2 bg-purple-600 rounded-full text-sm font-medium mb-6">
              PAST EVENT • JUNE 4, 2026
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              The Claude AI<br />Business Accelerator
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              This live workshop has concluded. Explore the training topics below, then choose a current FocusFlow program for your next step.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <span className="flex items-center gap-2 text-gray-400">
                📅 June 4, 2026
              </span>
              <span className="flex items-center gap-2 text-gray-400">
                🕕 6:00 PM - 9:00 PM
              </span>
              <span className="flex items-center gap-2 text-gray-400">
                📍 COED Columbus
              </span>
              <span className="flex items-center gap-2 text-green-400">
                🆓 FREE
              </span>
            </div>
            <Link
              to="/modules"
              className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-lg font-bold hover:scale-105 transition-transform"
            >
              Explore Current Programs
            </Link>
          </div>
        </section>

        {/* ─── WHO THIS IS FOR ─── */}
        <section className="py-16 px-6 bg-gray-900">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Perfect For Columbus Small Business Owners
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "💇 Salon & beauty studio owners",
                "🏠 Real estate agents & brokers",
                "🎯 Business coaches & consultants",
                "📝 Notaries & legal document preparers",
                "🛍️ Retail shop owners",
                "📊 Marketing agency founders"
              ].map((item, i) => (
                <div key={i} className="p-4 bg-gray-800 rounded-lg">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── WHAT YOU'LL LEARN ─── */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">
              5 AI Workflows You'll Build Live
            </h2>
            <div className="space-y-6">
              {[
                { num: "01", title: "Email Automation", sub: "Customer follow-up system", desc: "Never write a follow-up from scratch again" },
                { num: "02", title: "Content Calendar", sub: "AI social media workflow", desc: "Generate 30 days of posts in 10 minutes" },
                { num: "03", title: "Client Onboarding", sub: "Lead to client conversion", desc: "Auto-send welcome sequences & intake forms" },
                { num: "04", title: "Invoice & Payment", sub: "Revenue ops automation", desc: "Track who paid, who hasn't, auto-remind" },
                { num: "05", title: "Review Generation", sub: "Reputation growth engine", desc: "Auto-request Google reviews after every sale" }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-6 bg-gray-800 rounded-lg">
                  <span className="text-3xl font-bold text-purple-400">{item.num}</span>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <h4 className="text-sm uppercase tracking-[0.18em] text-purple-300 mb-2">{item.sub}</h4>
                    <p className="text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── LOCATION ─── */}
        <section className="py-16 px-6 bg-gray-900">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Where</h2>
            <p className="text-xl mb-4">COED Columbus</p>
            <p className="text-gray-400 mb-8">1890 E. Main Street, Columbus, OH 43205</p>
            <div className="bg-gray-800 rounded-lg p-8 text-gray-300">
              This in-person Columbus session concluded on June 4, 2026.
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Common Questions</h2>
            <div className="space-y-6">
              <details className="p-6 bg-gray-800 rounded-lg">
                <summary className="font-bold cursor-pointer">
                  <h4 className="inline">Is this only for Black entrepreneurs?</h4>
                </summary>
                <p className="mt-4 text-gray-300">
                  No, open to all Columbus small business owners. We emphasize Black entrepreneurship 
                  because these tools close gaps where support has been lightest.
                </p>
              </details>
              <details className="p-6 bg-gray-800 rounded-lg">
                <summary className="font-bold cursor-pointer">
                  <h4 className="inline">What should I bring?</h4>
                </summary>
                <p className="mt-4 text-gray-300">
                  Your laptop and a list of your most time-consuming tasks. We'll build live workflows 
                  tailored to your actual business.
                </p>
              </details>
              <details className="p-6 bg-gray-800 rounded-lg">
                <summary className="font-bold cursor-pointer">
                  <h4 className="inline">Will this be recorded?</h4>
                </summary>
                <p className="mt-4 text-gray-300">
                  This event has concluded. Visit the current programs page to see available training and resources.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="py-20 px-6 text-center bg-gradient-to-b from-purple-900 to-black">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Ready for Your Next Step?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Take the business clarity assessment or explore current programs built to turn AI ideas into practical systems.
            </p>
            <Link
              to="/assessment"
              className="inline-block px-10 py-5 bg-primary text-primary-foreground rounded-lg text-xl font-bold hover:scale-105 transition-transform"
            >
              Start the Business Assessment →
            </Link>
            <p className="mt-6 text-gray-500">
              June 4, 2026 • 6:00 PM - 9:00 PM • COED Columbus
            </p>
          </div>
        </section>

      </main>
    </>
  );
}
