import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";

const SITE = "https://coachkayai.life";

const Blog = () => {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: blogPosts.map((post, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE}/blog/${post.slug}`,
      name: post.title,
    })),
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Blog — FocusFlow AI by Coach Kay | AI for Small Business</title>
        <meta
          name="description"
          content="Practical AI workflows, prompts, and systems for small business owners. Real strategies from Coach Kay — built for salons, real estate, coaches, notaries, and service founders."
        />
        <link rel="canonical" href={`${SITE}/blog`} />
        <meta property="og:title" content="FocusFlow AI Blog — Practical AI for Small Business" />
        <meta
          property="og:description"
          content="Real AI workflows for small business owners. No fluff, no theory — just systems you can run today."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE}/blog`} />
        <script type="application/ld+json">{JSON.stringify(itemList)}</script>
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-primary/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.08),_transparent_60%)]" />
        <div className="container mx-auto px-6 pt-32 pb-20 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs uppercase tracking-[0.2em] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              The FocusFlow Journal
            </div>
            <h1 className="font-serif text-5xl md:text-7xl text-cream leading-[1.05] mb-6">
              AI systems for real{" "}
              <span className="text-primary italic">small businesses.</span>
            </h1>
            <p className="text-lg md:text-xl text-cream/70 max-w-2xl leading-relaxed">
              Practical workflows, prompts, and playbooks from Coach Kay.
              Written for owners who would rather move than read theory.
            </p>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post, i) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group relative flex flex-col rounded-2xl overflow-hidden border border-primary/10 bg-navy-light/40 hover:border-primary/40 transition-all duration-500 hover:-translate-y-1"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  loading={i === 0 ? "eager" : "lazy"}
                  width={1600}
                  height={1000}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-transparent to-transparent" />
              </div>
              <div className="flex-1 flex flex-col p-6">
                <div className="flex items-center gap-4 text-xs text-cream/50 uppercase tracking-wider mb-4">
                  <span className="inline-flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-primary" />
                    {post.category}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-primary" />
                    {post.readingTime}
                  </span>
                </div>
                <h2 className="font-serif text-2xl text-cream leading-tight mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-cream/60 text-sm leading-relaxed mb-6 flex-1">
                  {post.excerpt}
                </p>
                <span className="inline-flex items-center gap-2 text-primary text-sm font-medium">
                  Read article
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 pb-32">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-navy-light to-navy-deep p-10 md:p-16 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(var(--primary)/0.1),_transparent_70%)]" />
          <div className="relative">
            <h3 className="font-serif text-3xl md:text-5xl text-cream mb-4">
              Want to see where AI can save time in <em className="text-primary">your</em> business?
            </h3>
            <p className="text-cream/70 max-w-2xl mx-auto mb-8">
              Take the free 2-minute AI assessment. Get a personalized starting
              point built around how you actually work.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/assessment"
                className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                Take the Free AI Assessment
              </Link>
              <Link
                to="/starter-kit"
                className="px-8 py-4 rounded-full border border-primary/40 text-cream hover:bg-primary/10 transition-colors"
              >
                Join the Free Workshop
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;