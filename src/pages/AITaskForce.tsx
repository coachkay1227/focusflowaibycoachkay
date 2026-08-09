import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, Landmark, MapPin, Users } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import MobileNav from "@/components/MobileNav";
import BrandLogo from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { breadcrumb, SITE_URL, webPage } from "@/lib/seo-schema";

const focusAreas = [
  { icon: Building2, title: "Small Business & Workforce Readiness", body: "Helping Columbus businesses and workers build real AI skills with confidence." },
  { icon: Landmark, title: "Responsible AI in Public Life", body: "Supporting clear, human-centered guidelines for how AI shows up in our city." },
  { icon: MapPin, title: "Infrastructure & Community Impact", body: "Keeping the community informed as AI infrastructure grows in central Ohio." },
  { icon: Users, title: "Access for Every Neighborhood", body: "Making sure AI opportunity reaches residents who are too often left out, including second-chance citizens." },
];

export default function AITaskForce() {
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("sending");
    setError("");
    const { error: submitError } = await supabase.functions.invoke("submit-task-force-invitation", { body: form });
    if (submitError) {
      setError("Your request did not go through. Please try again.");
      setStatus("error");
      return;
    }
    setStatus("sent");
  };

  const jsonLd = [
    webPage("/ai-task-force", "Cbus AI Task Force", "AboutPage"),
    breadcrumb([{ name: "Home", path: "/" }, { name: "Cbus AI Task Force", path: "/ai-task-force" }], "/ai-task-force"),
    {
      "@context": "https://schema.org",
      "@type": "CivicStructure",
      "@id": `${SITE_URL}/ai-task-force#program`,
      name: "Cbus AI Task Force",
      description: "A Columbus program bringing leaders, businesses, and community together around responsible, people-centered AI adoption.",
      address: { "@type": "PostalAddress", addressLocality: "Columbus", addressRegion: "OH", addressCountry: "US" },
      founder: { "@type": "Person", name: "Coach Kay", alternateName: "Kenza Alaoui" },
    },
  ];

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SEOHead title="Cbus AI Task Force" description="Columbus leaders, businesses, and community shaping how our city adopts AI for the people who live here." path="/ai-task-force" jsonLd={jsonLd} keywords={["Columbus AI Task Force", "responsible AI Columbus", "AI workforce readiness Columbus"]} />
      <header className="px-6 sm:px-10 pt-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Home</Link>
        <BrandLogo size="sm" />
        <MobileNav />
      </header>

      <main>
        <section className="px-6 py-16 sm:py-24 text-center max-w-5xl mx-auto">
          <p className="font-mono-label text-primary text-xs tracking-[0.22em]">CBUS AI TASK FORCE · COLUMBUS, OHIO</p>
          <h1 className="font-heading text-4xl sm:text-6xl mt-5 leading-tight">AI is reshaping Columbus.<br /><span className="text-primary italic">Columbus should have a seat at the table.</span></h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">The Cbus AI Task Force brings leaders, businesses, and community together around one question: how does our city adopt AI in a way that works for the people who live here?</p>
          <Button asChild size="lg" className="mt-8"><a href="#invitation">Request an Invitation <ArrowRight /></a></Button>
        </section>

        <section className="bg-secondary/15 border-y border-border/50 px-6 py-16 sm:py-20">
          <AnimatedSection className="max-w-3xl mx-auto">
            <p className="font-mono-label text-primary text-xs tracking-[0.22em]">WHY NOW</p>
            <h2 className="font-heading text-3xl sm:text-4xl mt-3">The moment we’re in</h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>Columbus is one of the fastest-growing AI infrastructure hubs in the country. That growth brings real opportunity and real questions about jobs, small business readiness, public resources, and who gets a voice in what comes next.</p>
              <p>Cincinnati and Cleveland have each launched their own AI initiatives. Columbus has the talent, the institutions, and the momentum to lead. What it needs is a shared table.</p>
            </div>
          </AnimatedSection>
        </section>

        <section className="px-6 py-16 sm:py-20 max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-9"><p className="font-mono-label text-primary text-xs tracking-[0.22em]">WHAT WE FOCUS ON</p><h2 className="font-heading text-3xl sm:text-4xl mt-3">Four conversations, one table</h2></AnimatedSection>
          <div className="grid sm:grid-cols-2 gap-4">{focusAreas.map(({ icon: Icon, title, body }) => <article key={title} className="border border-border/60 bg-card/35 rounded-lg p-6"><Icon className="h-6 w-6 text-primary" /><h3 className="font-heading text-xl mt-4">{title}</h3><p className="text-sm text-muted-foreground mt-2 leading-relaxed">{body}</p></article>)}</div>
        </section>

        <section className="px-6 pb-16 sm:pb-20 max-w-4xl mx-auto grid md:grid-cols-2 gap-10">
          <AnimatedSection><p className="font-mono-label text-primary text-xs tracking-[0.22em]">WHO IT’S FOR</p><h2 className="font-heading text-3xl mt-3">Who belongs at this table</h2><p className="text-muted-foreground mt-4 leading-relaxed">Business leaders. Educators. Community organizations. Public servants. Neighbors who care about where this is going.</p><p className="text-foreground mt-4 font-medium">If AI is going to shape Columbus, the people of Columbus should shape how.</p></AnimatedSection>
          <AnimatedSection><p className="font-mono-label text-primary text-xs tracking-[0.22em]">THE CONVENER</p><h2 className="font-heading text-3xl mt-3">Convened by Coach Kay</h2><p className="text-muted-foreground mt-4 leading-relaxed">Coach Kay (Kenza Alaoui) is an AI Transformation Coach, 5x Certified Life Coach, Certified AI Prompt Engineer, and CPD-Accredited AI Consultant based in Columbus. She built her work in the margins of a full life, and she believes AI should work for everyday people, not just the companies deploying it.</p></AnimatedSection>
        </section>

        <section id="invitation" className="bg-secondary/15 border-y border-border/50 px-6 py-16 sm:py-20">
          <div className="max-w-2xl mx-auto">
            <p className="font-mono-label text-primary text-xs tracking-[0.22em]">GET INVOLVED</p>
            <h2 className="font-heading text-3xl sm:text-4xl mt-3">Be part of it</h2>
            <p className="text-muted-foreground mt-4">The Task Force is forming now. If you want to participate, partner, or support this work, start with one short note.</p>
            {status === "sent" ? <div role="status" className="mt-8 border border-primary/40 bg-primary/10 rounded-lg p-6"><h3 className="font-heading text-2xl">Your request is in.</h3><p className="text-muted-foreground mt-2">Every request is read personally. You’ll hear back within a few days.</p></div> : (
              <form onSubmit={submit} className="mt-8 space-y-5">
                <div><label htmlFor="task-name" className="text-sm font-medium">Name</label><Input id="task-name" required minLength={2} maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2" /></div>
                <div><label htmlFor="task-email" className="text-sm font-medium">Email</label><Input id="task-email" type="email" required maxLength={255} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2" /></div>
                <div><label htmlFor="task-message" className="text-sm font-medium">What brings you to this table?</label><Textarea id="task-message" required minLength={10} maxLength={2000} rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-2" /></div>
                <div className="hidden" aria-hidden="true"><label htmlFor="task-website">Website</label><Input id="task-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                <Button type="submit" size="lg" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Request an Invitation"}</Button>
              </form>
            )}
          </div>
        </section>
        <section className="px-6 py-12 text-center"><p className="font-heading text-2xl italic text-primary">Where Focus Goes, Energy Flows.</p></section>
      </main>
    </div>
  );
}