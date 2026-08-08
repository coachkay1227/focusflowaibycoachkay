import { useMemo, useState } from "react";
import QRCode from "qrcode";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import {
  SHAREABLE_OFFERS,
  SHAREABLE_GROUPS,
  shareableUrl,
  type ShareableOffer,
} from "@/lib/shareable-offers";
import { Copy, Download, ExternalLink } from "lucide-react";

const PUBLIC_ORIGIN = "https://coachkayai.life";

/** Print-ready QR codes for every offer. One permanent link per offer, with a
 *  source tag so a workshop lead can be attributed back to the room it
 *  came from. */
const AdminQrCodes = () => {
  const { toast } = useToast();
  const [source, setSource] = useState("");
  const [campaign, setCampaign] = useState("");
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string>("all");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SHAREABLE_OFFERS.filter((o) => {
      if (group !== "all" && o.group !== group) return false;
      if (!q) return true;
      return o.label.toLowerCase().includes(q) || o.slug.includes(q) || o.path.toLowerCase().includes(q);
    });
  }, [query, group]);

  const linkFor = (offer: ShareableOffer) =>
    shareableUrl(offer, {
      origin: PUBLIC_ORIGIN,
      source: source.trim() || undefined,
      medium: source.trim() ? "qr" : undefined,
      campaign: campaign.trim() || undefined,
    });

  const copy = async (offer: ShareableOffer) => {
    await navigator.clipboard.writeText(linkFor(offer));
    toast({ title: "Link copied", description: offer.label });
  };

  const download = async (offer: ShareableOffer, format: "png" | "svg") => {
    const url = linkFor(offer);
    try {
      const data =
        format === "png"
          ? await QRCode.toDataURL(url, { width: 1024, margin: 2, errorCorrectionLevel: "M" })
          : `data:image/svg+xml;utf8,${encodeURIComponent(
              await QRCode.toString(url, { type: "svg", margin: 2, errorCorrectionLevel: "M" }),
            )}`;
      const a = document.createElement("a");
      a.href = data;
      a.download = `qr-${offer.slug}${source.trim() ? `-${source.trim()}` : ""}.${format}`;
      a.click();
    } catch {
      toast({ title: "Could not generate that code", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-8">
          <h1 className="font-heading text-3xl text-foreground">QR codes</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            One permanent link per offer, ready to print for a class, workshop, or handout. Add a
            source tag and every scan is attributable to that room.
          </p>
        </header>

        <section className="mb-8 grid gap-4 rounded-xl border border-border bg-card p-5 md:grid-cols-3">
          <div>
            <Label htmlFor="qr-source">Source tag (where the code lives)</Label>
            <Input
              id="qr-source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="library-workshop-aug"
              maxLength={60}
            />
          </div>
          <div>
            <Label htmlFor="qr-campaign">Campaign (optional)</Label>
            <Input
              id="qr-campaign"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              placeholder="fall-cohort"
              maxLength={60}
            />
          </div>
          <div>
            <Label htmlFor="qr-search">Search offers</Label>
            <Input
              id="qr-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="audit, storybook, chatbot…"
            />
          </div>
        </section>

        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={group === "all" ? "default" : "outline"}
            onClick={() => setGroup("all")}
          >
            All ({SHAREABLE_OFFERS.length})
          </Button>
          {SHAREABLE_GROUPS.map((g) => (
            <Button key={g} size="sm" variant={group === g ? "default" : "outline"} onClick={() => setGroup(g)}>
              {g}
            </Button>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((offer) => (
            <article key={offer.slug} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
              <div>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h2 className="font-heading text-base leading-snug text-foreground">{offer.label}</h2>
                  <Badge variant={offer.directPurchase ? "default" : "outline"} className="shrink-0 text-[10px]">
                    {offer.directPurchase ? "Buy now" : "Inquiry"}
                  </Badge>
                </div>
                <p className="break-all font-mono text-[11px] text-muted-foreground">{linkFor(offer)}</p>
              </div>

              <QRCodeDisplay url={linkFor(offer)} size={150} />

              <div className="mt-auto flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => copy(offer)}>
                  <Copy className="mr-1 h-3 w-3" /> Copy
                </Button>
                <Button size="sm" variant="outline" onClick={() => download(offer, "png")}>
                  <Download className="mr-1 h-3 w-3" /> PNG
                </Button>
                <Button size="sm" variant="outline" onClick={() => download(offer, "svg")}>
                  <Download className="mr-1 h-3 w-3" /> SVG
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <a href={linkFor(offer)} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </article>
          ))}
        </div>

        {rows.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">No offers match that search.</p>
        )}
      </main>
    </div>
  );
};

export default AdminQrCodes;
