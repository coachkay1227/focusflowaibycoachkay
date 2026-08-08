import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRCodeDisplayProps {
  /** Absolute or relative URL to encode. Defaults to the current origin. */
  url?: string;
  size?: number;
  label?: string;
  /** Rendered as a data URL PNG so it can be printed or downloaded. */
  className?: string;
}

/** Real, scannable QR code. Uses the `qrcode` encoder (full spec: version
 *  selection, byte mode, Reed-Solomon error correction) instead of the
 *  hand-drawn placeholder matrix this component used to render. */
const QRCodeDisplay = ({ url, size = 220, label, className }: QRCodeDisplayProps) => {
  const target = url ?? (typeof window !== "undefined" ? window.location.href : "");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!target) return;
    QRCode.toDataURL(target, {
      width: size,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#0D1B2A", light: "#F5EDD6" },
    })
      .then((png) => {
        if (!cancelled) {
          setDataUrl(png);
          setFailed(false);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [target, size]);

  return (
    <div className={`flex flex-col items-center gap-3 ${className ?? ""}`}>
      <div
        className="rounded-xl border border-border bg-secondary p-3"
        style={{ width: size + 24, height: size + 24 }}
      >
        {dataUrl ? (
          <img src={dataUrl} alt={label ? `QR code: ${label}` : `QR code for ${target}`} width={size} height={size} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            {failed ? "QR unavailable" : "Generating…"}
          </div>
        )}
      </div>
      {label && (
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      )}
    </div>
  );
};

export default QRCodeDisplay;
