import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Upload, Download, CheckCircle2 } from "lucide-react";

type QualityLevel = "high" | "medium" | "low";

const QUALITY_OPTIONS: {
  level: QualityLevel;
  label: string;
  description: string;
  startQuality: number;   // initial JPEG quality attempt
  minQuality: number;     // minimum JPEG quality floor
  maxDimension: number;
  color: string;
  activeClass: string;
}[] = [
  {
    level: "high",
    label: "High Quality",
    description: "Best quality, good size reduction",
    startQuality: 0.80,
    minQuality: 0.55,
    maxDimension: 1920,
    color: "text-emerald-600",
    activeClass: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    level: "medium",
    label: "Medium Quality",
    description: "Balanced quality & file size",
    startQuality: 0.55,
    minQuality: 0.30,
    maxDimension: 1280,
    color: "text-blue-600",
    activeClass: "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
  },
  {
    level: "low",
    label: "Low Quality",
    description: "Maximum compression, smallest size",
    startQuality: 0.25,
    minQuality: 0.10,
    maxDimension: 800,
    color: "text-orange-600",
    activeClass: "border-orange-500 bg-orange-50 dark:bg-orange-950/30",
  },
];

/** Decode base64 data-URL size back to approximate byte count */
function dataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] ?? "";
  const padding = (base64.match(/=+$/) || [""])[0].length;
  return Math.floor((base64.length * 3) / 4) - padding;
}

/**
 * Compress dataUrl to JPEG. If the result is still larger than originalBytes,
 * iteratively reduce quality by `step` until it is smaller or we hit minQuality.
 */
function smartCompress(
  img: HTMLImageElement,
  maxDimension: number,
  startQuality: number,
  minQuality: number,
  originalBytes: number
): string {
  // Scale dimensions
  let { width, height } = img;
  if (width > height && width > maxDimension) {
    height = Math.round((height * maxDimension) / width);
    width = maxDimension;
  } else if (height > maxDimension) {
    width = Math.round((width * maxDimension) / height);
    height = maxDimension;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);

  let quality = startQuality;
  let result = canvas.toDataURL("image/jpeg", quality);

  // Iteratively reduce quality until output < original or we hit the floor
  while (dataUrlBytes(result) >= originalBytes && quality > minQuality) {
    quality = Math.max(quality - 0.07, minQuality);
    result = canvas.toDataURL("image/jpeg", quality);
  }

  return result;
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

    const img = new Image();
    img.onload = () => {
      const result = smartCompress(
        img,
        opt.maxDimension,
        opt.startQuality,
        opt.minQuality,
        origBytes
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
    originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;

  return (
    <ToolLayout
      toolId="img-comp"
      instructions={
        <ul className="list-disc pl-5 space-y-1">
          <li>Upload any image (JPEG, PNG, WebP).</li>
          <li>
            Choose a quality level: <strong>High</strong> keeps great quality
            with good size reduction, <strong>Medium</strong> balances quality
            and file size, <strong>Low</strong> gives the smallest possible
            file.
          </li>
          <li>The compressed size is shown instantly — switch quality anytime.</li>
          <li>Click <strong>Download</strong> to save as JPEG.</li>
          <li>All processing happens in your browser — no data leaves your device.</li>
        </ul>
      }
    >
      <div className="space-y-8">
        {/* ── Upload drop zone ── */}
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
              <p className="text-sm text-muted-foreground mt-1">
                Supports JPG, PNG, WebP
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Quality selector ── */}
            <div className="space-y-3">
              <p className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Select Quality
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
                          : "border-border bg-card hover:border-muted-foreground/40"
                        }`}
                    >
                      {isActive && (
                        <CheckCircle2
                          className={`absolute top-2 right-2 h-4 w-4 ${opt.color}`}
                        />
                      )}
                      <span
                        className={`font-bold text-sm ${isActive ? opt.color : ""}`}
                      >
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

            {/* ── Before / After preview ── */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Original */}
              <div className="space-y-3">
                <h3 className="font-medium text-muted-foreground text-sm">
                  Original
                </h3>
                <div className="aspect-video rounded-xl overflow-hidden border bg-muted flex items-center justify-center">
                  <img
                    src={image}
                    alt="Original"
                    className="object-contain w-full h-full"
                  />
                </div>
                <p className="text-sm font-medium text-center">
                  {formatSize(originalSize)}
                </p>
              </div>

              {/* Compressed */}
              <div className="space-y-3">
                <h3 className="font-medium text-muted-foreground text-sm flex items-center justify-between">
                  <span>Compressed</span>
                  {compressedSize > 0 && !isCompressing && (
                    <span className="text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full text-xs font-bold">
                      -{savedPercent}% saved
                    </span>
                  )}
                </h3>
                <div className="aspect-video rounded-xl overflow-hidden border bg-muted flex items-center justify-center">
                  {isCompressing ? (
                    <p className="text-sm text-muted-foreground animate-pulse">
                      Compressing…
                    </p>
                  ) : (
                    compressed && (
                      <img
                        src={compressed}
                        alt="Compressed"
                        className="object-contain w-full h-full"
                      />
                    )
                  )}
                </div>
                {compressedSize > 0 && !isCompressing && (
                  <div className="text-center">
                    <p className="text-sm font-bold text-primary">
                      {formatSize(compressedSize)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Saved {formatSize(savedBytes)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Action buttons ── */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleReset}
              >
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
