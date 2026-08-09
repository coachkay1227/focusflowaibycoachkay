import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ExternalLink, Gauge, GraduationCap, Layers, Network, ShieldCheck, Target, Users, Wrench } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import BrandLogo from "@/components/BrandLogo";
import MobileNav from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { breadcrumb, SITE_URL, webPage } from "@/lib/seo-schema";

export default function CollectiveAI() {
  const jsonLd = [
    webPage("/collective", "Collective AI", "AboutPage"),
    breadcrumb([{ name: "Home", path: "/" }, { name: "Collective AI", path: "/collective" }], "/collective"),
    { "@context": "https://schema.org", "@type": "Organization", "@id": `${SITE_URL}/collective#organization`, name: "Collective AI", founder: { "@type": "Person", name: "John Moyler" }, url: `${SITE_URL}/collective` },
  ];
  return <div className="min-h-dvh bg-background text-foreground">
    <SEOHead title="Collective AI" description="Collective AI is a separate enterprise founded by John Moyler, offering strategic AI consulting. Coach Kay participates as an AI partner." path="/collective" jsonLd={jsonLd} />
    <header className="px-6 sm:px-10 pt-6 flex items-center justify-between"><Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Home</Link><BrandLogo size="sm" /><MobileNav /></header>
    <main>
      <section className="px-6 py-20 sm:py-28 max-w-5xl mx-auto text-center"><p className="font-mono-label text-primary text-xs tracking-[0.22em]">SEPARATE ENTERPRISE · SHARED CAPACITY</p><h1 className="font-heading text-5xl sm:text-7xl mt-5">Collective AI</h1><p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">Collective AI is a separate enterprise founded by John Moyler. Coach Kay participates as an AI partner, bringing human-centered strategy and community perspective to work where those strengths fit.</p></section>
      <section className="px-6 pb-20 max-w-5xl mx-auto grid md:grid-cols-3 gap-4">
        <article className="rounded-lg border border-border/60 bg-card/35 p-6"><Network className="h-6 w-6 text-primary" /><h2 className="font-heading text-xl mt-4">The enterprise</h2><p className="text-sm text-muted-foreground mt-2 leading-relaxed">Collective AI is its own company and partner ecosystem. It is not Coach Kay Elevates and it is not owned or founded by Coach Kay.</p></article>
        <article className="rounded-lg border border-border/60 bg-card/35 p-6"><Users className="h-6 w-6 text-primary" /><h2 className="font-heading text-xl mt-4">Coach Kay’s role</h2><p className="text-sm text-muted-foreground mt-2 leading-relaxed">Coach Kay is an AI partner. Her role is distinct from John Moyler’s role as founder.</p></article>
        <article className="rounded-lg border border-border/60 bg-card/35 p-6"><Layers className="h-6 w-6 text-primary" /><h2 className="font-heading text-xl mt-4">The Cbus program</h2><p className="text-sm text-muted-foreground mt-2 leading-relaxed">The Cbus AI Task Force is Coach Kay’s Columbus-focused program. It has its own purpose, invitation process, and page.</p></article>
      </section>
      <section className="border-y border-border/50 bg-secondary/15 px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono-label text-primary text-xs tracking-[0.22em]">STRATEGIC AI CONSULTING</p>
          <h2 className="font-heading text-3xl sm:text-4xl mt-3">What Collective AI does</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">Their consulting practice works with businesses on AI adoption. The approach is collaborative, data-driven, and built around measurable results.</p>
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <article className="rounded-lg border border-border/60 bg-card/35 p-6"><Target className="h-6 w-6 text-primary" /><h3 className="font-heading text-xl mt-4">AI strategy and implementation</h3><p className="text-sm text-muted-foreground mt-2 leading-relaxed">AI strategies built around business goals, then carried through integration so the plan actually ships.</p></article>
            <article className="rounded-lg border border-border/60 bg-card/35 p-6"><Wrench className="h-6 w-6 text-primary" /><h3 className="font-heading text-xl mt-4">Custom AI solutions</h3><p className="text-sm text-muted-foreground mt-2 leading-relaxed">Bespoke AI models and applications built for the specific challenge in front of the business.</p></article>
            <article className="rounded-lg border border-border/60 bg-card/35 p-6"><GraduationCap className="h-6 w-6 text-primary" /><h3 className="font-heading text-xl mt-4">AI training and enablement</h3><p className="text-sm text-muted-foreground mt-2 leading-relaxed">Teams get the knowledge and the skills to use AI inside their own organization, not just a report about it.</p></article>
          </div>
          <p className="text-sm text-muted-foreground mt-6 leading-relaxed max-w-3xl">This is Collective AI's own consulting practice, described here because Coach Kay serves as an AI partner. Enterprise consulting engagements are booked through Collective AI, not through Coach Kay Elevates.</p>
        </div>
      </section>
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="font-heading text-3xl">How they work</h2>
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <article className="rounded-lg border border-border/60 bg-card/35 p-6"><Users className="h-6 w-6 text-primary" /><h3 className="font-heading text-lg mt-4">Expert team</h3><p className="text-sm text-muted-foreground mt-2 leading-relaxed">Seasoned AI practitioners with delivery experience across industries.</p></article>
          <article className="rounded-lg border border-border/60 bg-card/35 p-6"><ShieldCheck className="h-6 w-6 text-primary" /><h3 className="font-heading text-lg mt-4">Proven methodology</h3><p className="text-sm text-muted-foreground mt-2 leading-relaxed">A structured, agile process built for transparency and alignment with the business.</p></article>
          <article className="rounded-lg border border-border/60 bg-card/35 p-6"><Gauge className="h-6 w-6 text-primary" /><h3 className="font-heading text-lg mt-4">Rapid deployment</h3><p className="text-sm text-muted-foreground mt-2 leading-relaxed">Implementation moves fast so the benefits show up early instead of a year from now.</p></article>
        </div>
        <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4">
          <Button asChild size="lg"><a href="https://collectiveai.info/consultation" target="_blank" rel="noopener noreferrer">Book a consultation with Collective AI <ExternalLink /></a></Button>
          <a href="https://collectiveai.info/consulting" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4">See their full consulting offering</a>
        </div>
      </section>
      <section className="border-y border-border/50 bg-secondary/15 px-6 py-16 text-center"><h2 className="font-heading text-3xl">Looking for the Columbus program?</h2><p className="text-muted-foreground mt-3 max-w-xl mx-auto">The Cbus AI Task Force brings local leaders, businesses, and community together around people-centered AI adoption.</p><Button asChild size="lg" className="mt-7"><Link to="/ai-task-force">Visit the Cbus AI Task Force <ArrowRight /></Link></Button></section>
    </main>
  </div>;
}