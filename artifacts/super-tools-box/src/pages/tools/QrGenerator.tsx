import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Camera, Upload, QrCode, Copy, ExternalLink, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

type Tab = "generator" | "scanner";

export default function QrGenerator() {
  const [activeTab, setActiveTab] = useState<Tab>("generator");

  // Generator state
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#000000");
  const svgRef = useRef<SVGSVGElement>(null);

  // Scanner state
  const [scanResult, setScanResult] = useState<string>("");
  const [scanError, setScanError] = useState<string>("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const html5QrRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  // ---- Generator ----
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
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      if (title.trim()) {
        ctx.fillStyle = "#111111";
        ctx.font = `bold ${titleFontSize}px 'Segoe UI', Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(title.trim(), canvasWidth / 2, padding + titleFontSize / 2, canvasWidth - padding * 2);
      }
      ctx.drawImage(img, padding, titleAreaHeight + padding, qrSize, qrSize);
      const pngFile = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${(title.trim() || "qrcode").replace(/\s+/g, "_").toLowerCase()}_${Date.now()}.png`;
      link.href = pngFile;
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  // ---- Scanner ----
  const stopCamera = async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop(); } catch (_) {}
      try { html5QrRef.current.clear(); } catch (_) {}
      html5QrRef.current = null;
    }
    setIsCameraActive(false);
    setIsScanning(false);
  };

  const startCamera = async () => {
    setScanResult("");
    setScanError("");
    setIsScanning(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-camera-reader");
      html5QrRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decoded: string) => {
          setScanResult(decoded);
          stopCamera();
        },
        undefined
      );
      setIsCameraActive(true);
      setIsScanning(false);
    } catch (err: any) {
      setScanError("Camera access denied or not available. Please use gallery upload.");
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanResult("");
    setScanError("");
    setIsScanning(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-file-reader-hidden");
      const result = await scanner.scanFile(file, true);
      setScanResult(result);
      try { scanner.clear(); } catch (_) {}
    } catch (_) {
      setScanError("Could not read QR code from this image. Please try a clearer photo.");
    } finally {
      setIsScanning(false);
      if (e.target) e.target.value = "";
    }
  };

  const isUrl = (str: string) => /^https?:\/\//i.test(str.trim());
  const copyText = () => navigator.clipboard.writeText(scanResult);
  const openLink = () => window.open(scanResult, "_blank", "noopener");

  return (
    <ToolLayout toolId="qr-code"
      instructions={
        <ul className="list-disc pl-5">
          <li><b>Generator:</b> Enter any URL or text, optionally add a title, pick a colour, then download.</li>
          <li><b>Scanner:</b> Use your camera or upload a QR image from your gallery to decode it instantly.</li>
        </ul>
      }
    >
      {/* Tab switcher */}
      <div className="flex rounded-xl overflow-hidden border mb-8 w-full max-w-sm mx-auto">
        {(["generator", "scanner"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { stopCamera(); setScanResult(""); setScanError(""); setActiveTab(tab); }}
            className={`flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors
              ${activeTab === tab ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            {tab === "generator" ? <><QrCode className="h-4 w-4" /> Generator</> : <><Camera className="h-4 w-4" /> Scanner</>}
          </button>
        ))}
      </div>

      {/* ===== GENERATOR ===== */}
      {activeTab === "generator" && (
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="text">Content (URL, text, etc.)</Label>
              <Input id="text" placeholder="https://example.com" value={text} onChange={(e) => setText(e.target.value)} className="h-12 text-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Name / Title <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input id="title" placeholder="e.g. YouTube Channel, Website Name" value={title} onChange={(e) => setTitle(e.target.value)} className="h-12" />
              <p className="text-xs text-muted-foreground">Appears above QR code in the downloaded image.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">QR Code Color</Label>
              <div className="flex gap-4 items-center">
                <Input id="color" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-12 w-24 p-1 cursor-pointer" />
                <span className="font-mono text-sm uppercase text-muted-foreground">{color}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-6 p-8 bg-muted rounded-2xl border shadow-sm">
            <div className="bg-white p-6 rounded-xl shadow-md border inline-block">
              {title.trim() && <p className="text-center font-bold text-base mb-4 text-gray-800 max-w-[240px] break-words">{title}</p>}
              <QRCodeSVG value={text || "https://pockettoolskit.com"} size={240} fgColor={color} level="H" includeMargin={false} ref={svgRef} />
            </div>
            <Button onClick={handleDownload} disabled={!text} size="lg" className="w-full gap-2 font-semibold">
              <Download className="h-5 w-5" /> Download PNG
            </Button>
          </div>
        </div>
      )}

      {/* ===== SCANNER ===== */}
      {activeTab === "scanner" && (
        <div className="max-w-md mx-auto space-y-6">
          {/* Hidden div for file scanning */}
          <div id="qr-file-reader-hidden" className="hidden" />

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={isCameraActive ? stopCamera : startCamera} disabled={isScanning} variant={isCameraActive ? "destructive" : "default"} className="gap-2 h-12">
              {isCameraActive ? <><X className="h-4 w-4" /> Stop Camera</> : <><Camera className="h-4 w-4" /> Open Camera</>}
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} disabled={isScanning || isCameraActive} variant="outline" className="gap-2 h-12">
              <Upload className="h-4 w-4" /> Upload Image
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </div>

          {/* Camera viewer */}
          <div id="qr-camera-reader" className={`w-full rounded-xl overflow-hidden border ${!isCameraActive ? "hidden" : ""}`} />

          {isScanning && (
            <div className="text-center py-4 text-muted-foreground text-sm animate-pulse">Starting scanner…</div>
          )}

          {scanError && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">{scanError}</div>
          )}

          {scanResult && (
            <div className="p-5 bg-muted rounded-xl border space-y-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Scanned Result</p>
              <p className="text-sm break-all font-mono bg-background rounded-lg p-3 border">{scanResult}</p>
              <div className="flex gap-3">
                {isUrl(scanResult) ? (
                  <Button onClick={openLink} className="flex-1 gap-2" size="sm">
                    <ExternalLink className="h-4 w-4" /> Open Link
                  </Button>
                ) : (
                  <Button onClick={copyText} className="flex-1 gap-2" size="sm">
                    <Copy className="h-4 w-4" /> Copy Text
                  </Button>
                )}
                <Button onClick={() => setScanResult("")} variant="outline" size="sm">Clear</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
