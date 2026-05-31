import { Helmet } from "react-helmet-async";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, Clock, Tag } from "lucide-react";
import { getPostBySlug } from "@/data/blogPosts";

const SITE = "https://coachkayai.life";

const FAQS = [
  {
    q: "What is the best AI system for small business owners?",
    a: "The best AI system for most small business owners is a simple workflow using ChatGPT Plus or Claude AI to handle customer replies, scheduling support, follow-ups, and content creation.",
  },
  {
    q: "Can AI save small business owners time?",
    a: "Yes. AI can save small business owners hours each week by reducing repetitive tasks like answering common questions, writing follow-up messages, creating content, and drafting reminders.",
  },
  {
    q: "Do I need technical skills to use AI in my business?",
    a: "No. If you can type a message, you can use AI tools like ChatGPT or Claude. The key is using clear prompts and repeating simple workflows.",
  },
  {
    q: "How much does this AI system cost?",
    a: "Most small business owners can start for free, but paid versions of tools like ChatGPT Plus or Claude Pro are usually around $20 per month.",
  },
  {
    q: "Where can I learn this in Columbus?",
    a: "Columbus business owners can attend The Claude AI Business Accelerator, a free in-person workshop where entrepreneurs build practical AI workflows for their businesses.",
  },
];

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : null;

  if (!post) return <Navigate to="/blog" replace />;

  const url = `${SITE}/blog/${post.slug}`;
  // Vite-imported assets resolve to an absolute path like `/assets/xyz.jpg`.
  // Prepend SITE for crawlers/social previews; allow an explicit ogImage override.
  const imageUrl = post.ogImage
    ? post.ogImage
    : post.image.startsWith("http")
      ? post.image
      : `${SITE}${post.image.startsWith("/") ? post.image : "/" + post.image}`;
  const seoTitle = post.seoTitle ?? post.title;
  const seoDescription = post.seoDescription ?? post.excerpt;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: [imageUrl],
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    author: {
      "@type": "Person",
      name: "Coach Kay",
      url: `${SITE}/coach-kay`,
    },
    publisher: {
      "@type": "Organization",
      name: "FocusFlow AI — Coach Kay",
      logo: {
        "@type": "ImageObject",
        url: `${SITE}/og-image.png`,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "The Claude AI Business Accelerator",
    startDate: "2026-06-04T18:00:00-04:00",
    endDate: "2026-06-04T21:00:00-04:00",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
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
      geo: {
        "@type": "GeoCoordinates",
        latitude: 39.959786,
        longitude: -82.971428,
      },
    },
    image: [`${SITE}/og-image.png`],
    description:
      "Free AI training for Columbus small business owners. Build live workflows for salons, real estate, coaching, and notary businesses.",
    maximumAttendeeCapacity: 150,
    offers: {
      "@type": "Offer",
      name: "Free general admission",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://TheClaudeAIBusinessAccelerator.eventbrite.com",
      validFrom: "2026-04-01T00:00:00-04:00",
      category: "Free",
    },
    organizer: {
      "@type": "Organization",
      name: "FocusFlow AI — Coach Kay",
      url: SITE,
    },
    url: "https://TheClaudeAIBusinessAccelerator.eventbrite.com",
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{`${seoTitle} | FocusFlow AI by Coach Kay`}</title>
        <meta name="description" content={seoDescription} />
        {post.keywords?.length ? (
          <meta name="keywords" content={post.keywords.join(", ")} />
        ) : null}
        <link rel="canonical" href={url} />
        <meta name="robots" content="index, follow, max-image-preview:large" />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="FocusFlow AI by Coach Kay" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:alt" content={post.title} />
        <meta property="og:image:width" content="1600" />
        <meta property="og:image:height" content="1000" />
        <meta property="article:published_time" content={post.datePublished} />
        <meta property="article:modified_time" content={post.dateModified} />
        <meta property="article:author" content="Coach Kay" />
        <meta property="article:section" content={post.category} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:image:alt" content={post.title} />
        <meta name="twitter:label1" content="Reading time" />
        <meta name="twitter:data1" content={post.readingTime} />
        <meta name="twitter:label2" content="Written by" />
        <meta name="twitter:data2" content="Coach Kay" />

        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(eventSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
      </Helmet>

      {/* Header */}
      <article className="pt-28 pb-24">
        <header className="container mx-auto px-6 max-w-4xl">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-cream/60 hover:text-primary text-sm mb-10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to all articles
          </Link>

          <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.2em] text-cream/50 mb-6">
            <span className="inline-flex items-center gap-1.5 text-primary">
              <Tag className="w-3 h-3" /> {post.category}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> {post.readingTime}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {new Date(post.datePublished).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <h1 className="font-serif text-4xl md:text-6xl text-cream leading-[1.05] mb-6">
            {post.title}
          </h1>
          <p className="text-xl md:text-2xl text-cream/70 font-light leading-relaxed mb-12">
            {post.subtitle}
          </p>

          <div className="relative rounded-2xl overflow-hidden border border-primary/10 mb-16">
            <img
              src={post.image}
              alt="Quiet workspace — laptop, notebook, and coffee"
              width={1600}
              height={896}
              className="w-full h-auto"
            />
          </div>
        </header>

        {/* Body */}
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="prose-blog space-y-6 text-cream/85 text-lg leading-[1.8] font-light">
            <p>
              Most small business owners don't need more tools. They need fewer
              repetitive tasks. The problem is not a lack of effort. It's that
              too much time gets wasted on things that shouldn't require your
              attention in the first place.
            </p>
            <p>
              Customer replies. Scheduling. Follow-ups. Content ideas. Admin
              work. This is exactly where a simple $20 AI system can change
              everything. Not in theory. In practice. If you've already seen
              how a Columbus barbershop owner replaced a $600/month assistant
              using AI, then you already understand what's possible. Now let's
              make it real for you.
            </p>

            <H2>The Real Problem</H2>
            <p>If you run a small business, your day probably looks like this:</p>
            <ul className="list-none space-y-3 pl-0">
              {[
                "You answer the same customer questions again and again.",
                "You manually schedule appointments.",
                "You forget to follow up with leads.",
                "You spend time thinking about what to post online.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-primary mt-2">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>None of these tasks are hard. But they are time-consuming. And they kill momentum.</p>

            <H2>The Shift: From Manual Work to AI-Assisted Work</H2>
            <p>
              AI is not here to replace your business. It's here to remove the
              friction inside your business. When you remove friction, you get
              more time, faster execution, and better consistency.
            </p>
            <Pullquote>
              The business owner using AI is not working harder. They're working cleaner.
            </Pullquote>

            <H2>The $20 AI Stack</H2>
            <p>
              You don't need 10 tools. You need one core system. ChatGPT Plus or
              Claude AI costs about $20 per month. That's it.
            </p>
            <p>
              Many business owners are now using tools like Claude because the
              writing feels natural, the reasoning is sharper, and it handles
              real-world business tasks without the over-formatted, robotic
              output other tools produce. Whichever you pick, the workflow is
              the same — one tool, one habit, repeated daily.
            </p>

            <H2>The Five Workflows That Save 10 Hours a Week</H2>

            <H3>1. Customer Replies on Autopilot</H3>
            <p>
              Paste your most common customer questions into your AI tool. Ask
              it to write polished, on-brand replies. Save them as templates.
              Reuse them daily. You stop reinventing the wheel every time
              someone asks about pricing, hours, or services.
            </p>

            <H3>2. Smart Follow-Ups</H3>
            <p>
              For every lead, ask the AI to draft three follow-up messages: a
              warm one, a value-add one, and a final nudge. You'll never lose a
              deal because you forgot to circle back.
            </p>

            <H3>3. Content Without the Stress</H3>
            <p>
              Give the AI your week's topic. Ask for 10 short posts, 3 caption
              variations, and 1 long-form story. Pick the best ones. Post them.
              An entire week of content built in under 20 minutes.
            </p>

            <H3>4. Scheduling Support</H3>
            <p>
              Use AI to draft confirmation messages, reschedule replies, and
              reminder texts. Plug them into your calendar tool. You stop
              babysitting your inbox.
            </p>

            <H3>5. Admin and Notes</H3>
            <p>
              After every call, dump the messy notes into AI. Ask for a clean
              summary, action items, and a follow-up email. You walk away from
              every conversation with a paper trail instead of a memory.
            </p>

            <H2>Why This Works</H2>
            <p>
              The reason this $20 system works is simple: it removes decisions.
              Most small business owners don't lose hours to one big task. They
              lose hours to dozens of tiny decisions throughout the day. AI
              shrinks those decisions. It gives you a draft, a starting point,
              a structure — so you stop staring at blank screens.
            </p>

            <H2>How to Start This Week</H2>
            <ol className="list-none space-y-3 pl-0 counter-reset-blog">
              {[
                "Pick one tool. Claude or ChatGPT. Don't overthink it.",
                "Pick one workflow from the five above. Start with the one that bleeds the most time.",
                "Build five templates. Save them where you can reuse them.",
                "Use them every day for one week. Track the time saved.",
                "Add a second workflow the following week.",
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <span className="text-primary font-serif text-xl leading-none mt-1">
                    0{i + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
            <p>
              By week three, you'll feel the difference. By month two, you'll
              wonder how you ever ran the business without it.
            </p>

            <H2>The Bigger Picture</H2>
            <p>
              The owners who win the next five years are the ones who treat AI
              as part of their daily operation — not a side experiment. You
              don't need a tech team. You don't need to be early. You need a
              system. And $20 a month is a small price to buy back your time,
              your energy, and the freedom to actually grow.
            </p>
          </div>

          {/* Mid CTA */}
          <div className="my-16 relative overflow-hidden rounded-2xl border border-primary/20 bg-navy-light/50 p-8 md:p-10">
            <h3 className="font-serif text-2xl md:text-3xl text-cream mb-3">
              Want to see where AI can save time in your business?
            </h3>
            <p className="text-cream/70 mb-6">
              Take the free assessment — get a personalized AI starting point in two minutes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/assessment"
                className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                Take the Free AI Assessment
              </Link>
              <Link
                to="/starter-kit"
                className="px-6 py-3 rounded-full border border-primary/40 text-cream hover:bg-primary/10 transition-colors"
              >
                Join the Free Workshop
              </Link>
            </div>
          </div>

          {/* FAQ */}
          <section className="mt-20">
            <h2 className="font-serif text-3xl md:text-4xl text-cream mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {FAQS.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-xl border border-primary/15 bg-navy-light/40 p-6 open:border-primary/40 transition-colors"
                >
                  <summary className="font-serif text-xl text-cream cursor-pointer list-none flex items-center justify-between gap-4">
                    {f.q}
                    <span className="text-primary text-2xl transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-cream/70 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Event CTA */}
          <section className="mt-20 relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-navy-deep via-navy to-navy-light p-10 md:p-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_hsl(var(--primary)/0.15),_transparent_60%)]" />
            <div className="relative">
              <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">
                Live in Columbus · June 4, 2026
              </div>
              <h2 className="font-serif text-3xl md:text-5xl text-cream leading-tight mb-4">
                The Claude AI Business Accelerator
              </h2>
              <p className="text-cream/70 text-lg mb-6 max-w-2xl">
                Free in-person workshop at COED Columbus. Build live AI
                workflows for your business. 150 seats. No experience required.
              </p>
              <ul className="space-y-2 text-cream/80 mb-8">
                <li>6:00 PM – 9:00 PM · COED Columbus</li>
                <li>1890 E. Main Street, Columbus, OH 43205</li>
                <li>Hosted by Coach Kay / FocusFlow AI</li>
              </ul>
              <a
                href="https://TheClaudeAIBusinessAccelerator.eventbrite.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                Reserve a Free Seat <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </section>

          {/* Final CTA */}
          <section className="mt-20 text-center">
            <h2 className="font-serif text-3xl md:text-5xl text-cream mb-4">
              Ready to build your AI system?
            </h2>
            <p className="text-cream/70 max-w-xl mx-auto mb-8">
              Start with the free playbook, or work with Coach Kay directly to
              install AI into your business end-to-end.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/starter-kit"
                className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                Start Here
              </Link>
              <Link
                to="/coach-kay"
                className="px-8 py-4 rounded-full border border-primary/40 text-cream hover:bg-primary/10 transition-colors"
              >
                Work With Coach Kay
              </Link>
            </div>
          </section>

          {/* Internal link cluster */}
          <nav
            aria-label="Related pages"
            className="mt-20 pt-10 border-t border-primary/10 grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm"
          >
            {[
              { to: "/starter-kit", label: "Start Here" },
              { to: "/assessment", label: "Free AI Assessment" },
              { to: "/ai-tools", label: "AI Tools" },
              { to: "/coach-kay", label: "Work With Me" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="group flex items-center justify-between rounded-xl border border-primary/10 hover:border-primary/40 bg-navy-light/30 px-5 py-4 text-cream/80 hover:text-primary transition-colors"
              >
                {l.label}
                <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </nav>
        </div>
      </article>
    </div>
  );
};

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-serif text-3xl md:text-4xl text-cream mt-14 mb-4 leading-tight">
    {children}
  </h2>
);
const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-serif text-2xl text-primary mt-10 mb-3">{children}</h3>
);
const Pullquote = ({ children }: { children: React.ReactNode }) => (
  <blockquote className="relative my-10 pl-6 border-l-2 border-primary text-cream font-serif text-2xl italic leading-snug">
    {children}
  </blockquote>
);

export default BlogPost;