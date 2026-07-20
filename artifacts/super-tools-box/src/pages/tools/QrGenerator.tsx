import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function QrGenerator() {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#000000");
  const svgRef = useRef<SVGSVGElement>(null);

  const handleDownload = () => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);

    const qrSize = 600;
    const padding = 48;
    const titleFontSize = 42;
    const titleAreaHeight = title.trim() ? titleFontSize + 36 : 0;
    const canvasWidth = qrSize + padding * 2;
    const canvasHeight = qrSize + padding * 2 + titleAreaHeight;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const img = new Image();

    img.onload = () => {
      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw title if provided
      if (title.trim()) {
        ctx.fillStyle = "#111111";
        ctx.font = `bold ${titleFontSize}px 'Segoe UI', Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(title.trim(), canvasWidth / 2, padding + titleFontSize / 2, canvasWidth - padding * 2);
      }

      // Draw QR code below title
      const qrY = titleAreaHeight + padding;
      ctx.drawImage(img, padding, qrY, qrSize, qrSize);

      // Download
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      const safeName = (title.trim() || "qrcode").replace(/\s+/g, "_").toLowerCase();
      downloadLink.download = `${safeName}_${Date.now()}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <ToolLayout toolId="qr-code"
      instructions={
        <ul className="list-disc pl-5">
          <li>Enter any URL, text, email, or phone number in the content box.</li>
          <li>Optionally enter a Name/Title (e.g. YouTube Channel Name, Website Name) — it will appear above the QR code in the downloaded image.</li>
          <li>The QR code updates in real-time as you type.</li>
          <li>Customize the QR code color if desired.</li>
          <li>Click 'Download PNG' to save a high-resolution image with your title and QR code.</li>
        </ul>
      }
    >
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className="space-y-6">
          {/* Content input */}
          <div className="space-y-2">
            <Label htmlFor="text">Content (URL, text, etc.)</Label>
            <Input
              id="text"
              placeholder="https://example.com"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-12 text-lg"
            />
          </div>

          {/* Title / Name input */}
          <div className="space-y-2">
            <Label htmlFor="title">Name / Title <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              id="title"
              placeholder="e.g. YouTube Channel Name, Website Name, Contact Info"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 text-base"
            />
            <p className="text-xs text-muted-foreground">This name will appear above the QR code in the downloaded image.</p>
          </div>

          {/* Color picker */}
          <div className="space-y-2">
            <Label htmlFor="color">QR Code Color</Label>
            <div className="flex gap-4 items-center">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-12 w-24 p-1 cursor-pointer"
              />
              <span className="font-mono text-sm uppercase text-muted-foreground">{color}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 p-8 bg-muted rounded-2xl border shadow-sm">
          {/* Live preview */}
          <div className="bg-white p-6 rounded-xl shadow-md border inline-block">
            {title.trim() && (
              <p className="text-center font-bold text-base mb-4 text-gray-800 max-w-[240px] break-words">
                {title}
              </p>
            )}
            <QRCodeSVG
              value={text || "https://supertoolsbox.com"}
              size={240}
              fgColor={color}
              level="H"
              includeMargin={false}
              ref={svgRef}
            />
          </div>

          <Button
            onClick={handleDownload}
            disabled={!text}
            size="lg"
            className="w-full gap-2 font-semibold"
          >
            <Download className="h-5 w-5" /> Download PNG
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}
