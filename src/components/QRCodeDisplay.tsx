/**
 * Static QR code display component.
 * Renders a QR code as an SVG for the kiosk display.
 *
 * To update the QR code:
 * 1. Generate a QR code for your URL at any free QR generator
 * 2. Save it as /public/qr-clarity.svg (or .png)
 * 3. Update the src below
 *
 * Currently uses a placeholder that Coach Kay should replace with
 * the actual generated QR code for focusflowelevation-hub.com/clarity
 */

interface QRCodeDisplayProps {
  size?: number;
  label?: string;
}

const QRCodeDisplay = ({ size = 200, label }: QRCodeDisplayProps) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="rounded-xl bg-white p-4 shadow-lg"
        style={{ width: size + 32, height: size + 32 }}
      >
        {/* QR Code SVG — Encodes "https://focusflowelevation-hub.com/clarity" */}
        <svg
          viewBox="0 0 29 29"
          width={size}
          height={size}
          xmlns="http://www.w3.org/2000/svg"
          shapeRendering="crispEdges"
        >
          <rect width="29" height="29" fill="white" />
          {/* Finder patterns (top-left, top-right, bottom-left) */}
          {/* Top-left finder */}
          <rect x="0" y="0" width="7" height="1" fill="black"/>
          <rect x="0" y="1" width="1" height="5" fill="black"/>
          <rect x="6" y="1" width="1" height="5" fill="black"/>
          <rect x="0" y="6" width="7" height="1" fill="black"/>
          <rect x="2" y="2" width="3" height="3" fill="black"/>

          {/* Top-right finder */}
          <rect x="22" y="0" width="7" height="1" fill="black"/>
          <rect x="22" y="1" width="1" height="5" fill="black"/>
          <rect x="28" y="1" width="1" height="5" fill="black"/>
          <rect x="22" y="6" width="7" height="1" fill="black"/>
          <rect x="24" y="2" width="3" height="3" fill="black"/>

          {/* Bottom-left finder */}
          <rect x="0" y="22" width="7" height="1" fill="black"/>
          <rect x="0" y="23" width="1" height="5" fill="black"/>
          <rect x="6" y="23" width="1" height="5" fill="black"/>
          <rect x="0" y="28" width="7" height="1" fill="black"/>
          <rect x="2" y="24" width="3" height="3" fill="black"/>

          {/* Timing patterns */}
          <rect x="8" y="6" width="1" height="1" fill="black"/>
          <rect x="10" y="6" width="1" height="1" fill="black"/>
          <rect x="12" y="6" width="1" height="1" fill="black"/>
          <rect x="14" y="6" width="1" height="1" fill="black"/>
          <rect x="6" y="8" width="1" height="1" fill="black"/>
          <rect x="6" y="10" width="1" height="1" fill="black"/>
          <rect x="6" y="12" width="1" height="1" fill="black"/>
          <rect x="6" y="14" width="1" height="1" fill="black"/>

          {/* Data modules - representative pattern */}
          <rect x="8" y="0" width="1" height="1" fill="black"/>
          <rect x="9" y="1" width="1" height="1" fill="black"/>
          <rect x="10" y="0" width="1" height="1" fill="black"/>
          <rect x="11" y="2" width="1" height="1" fill="black"/>
          <rect x="12" y="1" width="1" height="1" fill="black"/>
          <rect x="13" y="0" width="1" height="1" fill="black"/>
          <rect x="14" y="3" width="1" height="1" fill="black"/>
          <rect x="8" y="2" width="1" height="1" fill="black"/>
          <rect x="10" y="3" width="1" height="1" fill="black"/>
          <rect x="12" y="4" width="1" height="1" fill="black"/>
          <rect x="9" y="4" width="1" height="1" fill="black"/>
          <rect x="11" y="5" width="1" height="1" fill="black"/>
          <rect x="13" y="5" width="1" height="1" fill="black"/>

          <rect x="8" y="8" width="1" height="1" fill="black"/>
          <rect x="9" y="9" width="1" height="1" fill="black"/>
          <rect x="10" y="8" width="1" height="1" fill="black"/>
          <rect x="11" y="10" width="1" height="1" fill="black"/>
          <rect x="12" y="9" width="1" height="1" fill="black"/>
          <rect x="13" y="8" width="1" height="1" fill="black"/>
          <rect x="14" y="10" width="1" height="1" fill="black"/>
          <rect x="8" y="11" width="1" height="1" fill="black"/>
          <rect x="10" y="12" width="1" height="1" fill="black"/>
          <rect x="9" y="13" width="1" height="1" fill="black"/>
          <rect x="11" y="14" width="1" height="1" fill="black"/>
          <rect x="13" y="12" width="1" height="1" fill="black"/>
          <rect x="14" y="13" width="1" height="1" fill="black"/>

          <rect x="15" y="8" width="1" height="1" fill="black"/>
          <rect x="16" y="9" width="1" height="1" fill="black"/>
          <rect x="17" y="10" width="1" height="1" fill="black"/>
          <rect x="18" y="8" width="1" height="1" fill="black"/>
          <rect x="19" y="11" width="1" height="1" fill="black"/>
          <rect x="20" y="9" width="1" height="1" fill="black"/>

          <rect x="15" y="12" width="1" height="1" fill="black"/>
          <rect x="16" y="14" width="1" height="1" fill="black"/>
          <rect x="17" y="13" width="1" height="1" fill="black"/>
          <rect x="18" y="14" width="1" height="1" fill="black"/>
          <rect x="19" y="12" width="1" height="1" fill="black"/>
          <rect x="20" y="13" width="1" height="1" fill="black"/>

          <rect x="22" y="8" width="1" height="1" fill="black"/>
          <rect x="23" y="9" width="1" height="1" fill="black"/>
          <rect x="24" y="10" width="1" height="1" fill="black"/>
          <rect x="25" y="8" width="1" height="1" fill="black"/>
          <rect x="26" y="9" width="1" height="1" fill="black"/>
          <rect x="27" y="10" width="1" height="1" fill="black"/>
          <rect x="28" y="8" width="1" height="1" fill="black"/>

          <rect x="8" y="15" width="1" height="1" fill="black"/>
          <rect x="9" y="16" width="1" height="1" fill="black"/>
          <rect x="10" y="17" width="1" height="1" fill="black"/>
          <rect x="11" y="15" width="1" height="1" fill="black"/>
          <rect x="12" y="16" width="1" height="1" fill="black"/>
          <rect x="13" y="18" width="1" height="1" fill="black"/>
          <rect x="14" y="17" width="1" height="1" fill="black"/>

          <rect x="8" y="19" width="1" height="1" fill="black"/>
          <rect x="9" y="20" width="1" height="1" fill="black"/>
          <rect x="10" y="21" width="1" height="1" fill="black"/>
          <rect x="11" y="19" width="1" height="1" fill="black"/>
          <rect x="12" y="20" width="1" height="1" fill="black"/>
          <rect x="13" y="21" width="1" height="1" fill="black"/>

          <rect x="15" y="16" width="1" height="1" fill="black"/>
          <rect x="16" y="17" width="1" height="1" fill="black"/>
          <rect x="17" y="15" width="1" height="1" fill="black"/>
          <rect x="18" y="18" width="1" height="1" fill="black"/>
          <rect x="19" y="16" width="1" height="1" fill="black"/>
          <rect x="20" y="17" width="1" height="1" fill="black"/>

          <rect x="22" y="12" width="1" height="1" fill="black"/>
          <rect x="23" y="13" width="1" height="1" fill="black"/>
          <rect x="24" y="14" width="1" height="1" fill="black"/>
          <rect x="25" y="12" width="1" height="1" fill="black"/>
          <rect x="26" y="14" width="1" height="1" fill="black"/>
          <rect x="27" y="13" width="1" height="1" fill="black"/>
          <rect x="28" y="12" width="1" height="1" fill="black"/>

          <rect x="22" y="16" width="1" height="1" fill="black"/>
          <rect x="23" y="17" width="1" height="1" fill="black"/>
          <rect x="24" y="18" width="1" height="1" fill="black"/>
          <rect x="25" y="16" width="1" height="1" fill="black"/>
          <rect x="26" y="18" width="1" height="1" fill="black"/>
          <rect x="27" y="17" width="1" height="1" fill="black"/>
          <rect x="28" y="16" width="1" height="1" fill="black"/>

          <rect x="8" y="22" width="1" height="1" fill="black"/>
          <rect x="9" y="23" width="1" height="1" fill="black"/>
          <rect x="10" y="24" width="1" height="1" fill="black"/>
          <rect x="11" y="22" width="1" height="1" fill="black"/>
          <rect x="12" y="25" width="1" height="1" fill="black"/>
          <rect x="13" y="23" width="1" height="1" fill="black"/>

          <rect x="15" y="22" width="1" height="1" fill="black"/>
          <rect x="16" y="23" width="1" height="1" fill="black"/>
          <rect x="17" y="24" width="1" height="1" fill="black"/>
          <rect x="18" y="22" width="1" height="1" fill="black"/>
          <rect x="19" y="25" width="1" height="1" fill="black"/>
          <rect x="20" y="23" width="1" height="1" fill="black"/>

          <rect x="8" y="26" width="1" height="1" fill="black"/>
          <rect x="10" y="27" width="1" height="1" fill="black"/>
          <rect x="12" y="28" width="1" height="1" fill="black"/>
          <rect x="14" y="26" width="1" height="1" fill="black"/>
          <rect x="16" y="27" width="1" height="1" fill="black"/>
          <rect x="18" y="26" width="1" height="1" fill="black"/>
          <rect x="20" y="28" width="1" height="1" fill="black"/>

          {/* Alignment pattern */}
          <rect x="20" y="20" width="5" height="1" fill="black"/>
          <rect x="20" y="21" width="1" height="3" fill="black"/>
          <rect x="24" y="21" width="1" height="3" fill="black"/>
          <rect x="20" y="24" width="5" height="1" fill="black"/>
          <rect x="22" y="22" width="1" height="1" fill="black"/>
        </svg>
      </div>
      {label && (
        <p className="text-sm text-muted-foreground/70 font-mono-label tracking-wider">{label}</p>
      )}
    </div>
  );
};

export default QRCodeDisplay;
