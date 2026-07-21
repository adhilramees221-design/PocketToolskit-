import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Upload, Download, CheckCircle2 } from "lucide-react";

type QualityLevel = "high" | "medium" | "low";

interface QualityOption {
  level: QualityLevel;
  label: string;
  description: string;
  targetRatio: number;   // compressed / original target (upper bound)
  maxDimension: number;  // max width or height in pixels
  minJpeg: number;       // binary-search lower bound
  maxJpeg: number;       // binary-search upper bound
  color: string;
  activeClass: string;
}

const QUALITY_OPTIONS: QualityOption[] = [
  {
    level: "high",
    label: "High Quality",
    description: "No visible quality loss, ~35–40% smaller",
    targetRatio: 0.63,   // aim for ≤63% of original size
    maxDimension: 9999,  // keep original dimensions
    minJpeg: 0.60,
    maxJpeg: 0.95,
    color: "text-emerald-600",
    activeClass: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    level: "medium",
    label: "Medium Quality",
    description: "Slight quality drop, ~50–55% smaller",
    targetRatio: 0.46,   // aim for ≤46% of original size
    maxDimension: 1600,
    minJpeg: 0.30,
    maxJpeg: 0.70,
    color: "text-blue-600",
    activeClass: "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
  },
  {
    level: "low",
    label: "Low Quality",
    description: "Maximum compression, ~75–85% smaller",
    targetRatio: 0.22,   // aim for ≤22% of original size
    maxDimension: 900,
    minJpeg: 0.05,
    maxJpeg: 0.35,
    color: "text-orange-600",
    activeClass: "border-orange-500 bg-orange-50 dark:bg-orange-950/30",
  },
];

/** Decode base64 data-URL → approximate byte count */
function dataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] ?? "";
  const padding = (base64.match(/=+$/) ?? [""])[0].length;
  return Math.floor((base64.length * 3) / 4) - padding;
}

/**
 * Binary-search the JPEG quality that brings the output size as close as
 * possible to `targetRatio * originalBytes` while always staying below it.
 * Falls back to minJpeg if no quality in [minJpeg, maxJpeg] is small enough.
 */
function binarySearchCompress(
  canvas: HTMLCanvasElement,
  targetRatio: number,
  originalBytes: number,
  minJpeg: number,
  maxJpeg: number,
  iterations = 16
): string {
  const target = targetRatio * originalBytes;

  // First check: can maxJpeg even reach the target?
  // If not, start from the lowest quality to guarantee we're under target.
  let lo = minJpeg;
  let hi = maxJpeg;
  let best = canvas.toDataURL("image/jpeg", lo); // safest fallback

  for (let i = 0; i < iterations; i++) {
    const mid = (lo + hi) / 2;
    const candidate = canvas.toDataURL("image/jpeg", mid);
    const size = dataUrlBytes(candidate);

    if (size <= target) {
      // This quality fits — record it and try going higher (better quality)
      best = candidate;
      lo = mid;
    } else {
      // Too large — need lower quality
      hi = mid;
    }
    if (hi - lo < 0.005) break; // converged
  }

  // Final safety: if even best is still >= original, force minJpeg
  if (dataUrlBytes(best) >= originalBytes) {
    best = canvas.toDataURL("image/jpeg", minJpeg);
  }

  return best;
}

function buildCanvas(img: HTMLImageElement, maxDimension: number): HTMLCanvasElement {
  let { width, height } = img;
  if (maxDimension < 9999) {
    if (width > height && width > maxDimension) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else if (height > maxDimension) {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
  return canvas;
}

export default function ImageCompressor() {
  const [image, setImage] = useState<string | null>(null);
  const [compressed, setCompressed] = useState<string | null>(null);
  const [qualityLevel, setQualityLevel] = useState<QualityLevel>("medium");
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const runCompression = (dataUrl: string, level: QualityLevel, origBytes: number) => {
    const opt = QUALITY_OPTIONS.find((o) => o.level === level)!;
    setIsCompressing(true);
    setCompressed(null);
    setCompressedSize(0);

    const img = new Image();
    img.onload = () => {
      const canvas = buildCanvas(img, opt.maxDimension);
      const result = binarySearchCompress(
        canvas,
        opt.targetRatio,
        origBytes,
        opt.minJpeg,
        opt.maxJpeg
      );
      setCompressed(result);
      setCompressedSize(dataUrlBytes(result));
      setIsCompressing(false);
    };
    img.src = dataUrl;
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const origBytes = file.size;
    setOriginalSize(origBytes);
    setCompressed(null);
    setCompressedSize(0);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImage(dataUrl);
      runCompression(dataUrl, qualityLevel, origBytes);
    };
    reader.readAsDataURL(file);
  };

  const handleQualitySelect = (level: QualityLevel) => {
    setQualityLevel(level);
    if (image && originalSize > 0) runCompression(image, level, originalSize);
  };

  const handleReset = () => {
    setImage(null);
    setCompressed(null);
    setOriginalSize(0);
    setCompressedSize(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadImage = () => {
    if (!compressed) return;
    const link = document.createElement("a");
    link.href = compressed;
    link.download = `compressed_${qualityLevel}_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const savedBytes = originalSize - compressedSize;
  const savedPercent =
    originalSize > 0 && compressedSize > 0
      ? Math.round((savedBytes / originalSize) * 100)
      : 0;

  return (
    <ToolLayout
      toolId="img-comp"
      instructions={
        <ul className="list-disc pl-5 space-y-1">
          <li>Upload any image (JPEG, PNG, WebP).</li>
          <li><strong>High Quality</strong> — virtually no visible change, ~35–40% smaller.</li>
          <li><strong>Medium Quality</strong> — minor quality drop, ~50–55% smaller.</li>
          <li><strong>Low Quality</strong> — maximum compression, ~75–85% smaller.</li>
          <li>Original and compressed file sizes are shown for comparison.</li>
          <li>Click <strong>Download</strong> to save the compressed image as JPEG.</li>
          <li>Everything runs in your browser — no file is uploaded to any server.</li>
        </ul>
      }
    >
      <div className="space-y-8">

        {/* ── Upload zone ── */}
        {!image ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30 transition-all rounded-2xl p-12 text-center cursor-pointer flex flex-col items-center gap-4"
          >
            <div className="bg-primary/10 p-4 rounded-full text-primary">
              <Upload className="h-8 w-8" />
            </div>
            <div>
              <p className="font-semibold text-lg">Click or drag image to upload</p>
              <p className="text-sm text-muted-foreground mt-1">Supports JPG, PNG, WebP</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Quality selector ── */}
            <div className="space-y-3">
              <p className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Select Compression Level
              </p>
              <div className="grid grid-cols-3 gap-3">
                {QUALITY_OPTIONS.map((opt) => {
                  const isActive = qualityLevel === opt.level;
                  return (
                    <button
                      key={opt.level}
                      onClick={() => handleQualitySelect(opt.level)}
                      className={`relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 text-center transition-all focus:outline-none
                        ${isActive
                          ? opt.activeClass + " shadow-sm"
                          : "border-border bg-card hover:border-muted-foreground/40"}`}
                    >
                      {isActive && (
                        <CheckCircle2 className={`absolute top-2 right-2 h-4 w-4 ${opt.color}`} />
                      )}
                      <span className={`font-bold text-sm ${isActive ? opt.color : ""}`}>
                        {opt.label}
                      </span>
                      <span className="text-xs text-muted-foreground leading-tight">
                        {opt.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Size summary bar ── */}
            {(compressedSize > 0 || isCompressing) && (
              <div className="flex items-center justify-between rounded-xl bg-muted px-5 py-3 text-sm">
                <span>
                  <span className="text-muted-foreground">Original: </span>
                  <span className="font-semibold">{formatSize(originalSize)}</span>
                </span>
                {isCompressing ? (
                  <span className="text-muted-foreground animate-pulse">Compressing…</span>
                ) : (
                  <>
                    <span className="text-emerald-600 font-bold bg-emerald-500/10 px-3 py-1 rounded-full">
                      ↓ {savedPercent}% saved ({formatSize(savedBytes)})
                    </span>
                    <span>
                      <span className="text-muted-foreground">Compressed: </span>
                      <span className="font-semibold text-primary">{formatSize(compressedSize)}</span>
                    </span>
                  </>
                )}
              </div>
            )}

            {/* ── Before / After images ── */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-medium text-muted-foreground text-sm">Original</h3>
                <div className="aspect-video rounded-xl overflow-hidden border bg-muted flex items-center justify-center">
                  <img src={image} alt="Original" className="object-contain w-full h-full" />
                </div>
                <p className="text-sm font-medium text-center">{formatSize(originalSize)}</p>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-muted-foreground text-sm">Compressed</h3>
                <div className="aspect-video rounded-xl overflow-hidden border bg-muted flex items-center justify-center">
                  {isCompressing ? (
                    <p className="text-sm text-muted-foreground animate-pulse">Compressing…</p>
                  ) : compressed ? (
                    <img src={compressed} alt="Compressed" className="object-contain w-full h-full" />
                  ) : null}
                </div>
                {compressedSize > 0 && !isCompressing && (
                  <p className="text-sm font-bold text-primary text-center">
                    {formatSize(compressedSize)}
                  </p>
                )}
              </div>
            </div>

            {/* ── Action buttons ── */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={handleReset}>
                <Upload className="h-4 w-4 mr-2" /> Upload New Image
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={downloadImage}
                disabled={!compressed || isCompressing}
              >
                <Download className="h-4 w-4" /> Download Compressed
              </Button>
            </div>
          </>
        )}

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleUpload}
        />
      </div>
    </ToolLayout>
  );
}
