import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Upload, Download, CheckCircle2 } from "lucide-react";

type QualityLevel = "high" | "medium" | "low";

const QUALITY_OPTIONS: {
  level: QualityLevel;
  label: string;
  description: string;
  jpegQuality: number;
  maxDimension: number;
  color: string;
  activeClass: string;
}[] = [
  {
    level: "high",
    label: "High Quality",
    description: "Best quality, slight size reduction",
    jpegQuality: 0.85,
    maxDimension: 2400,
    color: "text-emerald-600",
    activeClass: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    level: "medium",
    label: "Medium Quality",
    description: "Balanced quality & file size",
    jpegQuality: 0.60,
    maxDimension: 1600,
    color: "text-blue-600",
    activeClass: "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
  },
  {
    level: "low",
    label: "Low Quality",
    description: "Maximum compression, smallest size",
    jpegQuality: 0.28,
    maxDimension: 1000,
    color: "text-orange-600",
    activeClass: "border-orange-500 bg-orange-50 dark:bg-orange-950/30",
  },
];

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

  const compressImage = (dataUrl: string, level: QualityLevel) => {
    const option = QUALITY_OPTIONS.find((o) => o.level === level)!;
    setIsCompressing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      const max = option.maxDimension;
      if (width > height && width > max) {
        height = Math.round((height * max) / width);
        width = max;
      } else if (height > max) {
        width = Math.round((width * max) / height);
        height = max;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL("image/jpeg", option.jpegQuality);
      setCompressed(compressedDataUrl);

      const head = "data:image/jpeg;base64,";
      const size = Math.round(((compressedDataUrl.length - head.length) * 3) / 4);
      setCompressedSize(size);
      setIsCompressing(false);
    };
    img.src = dataUrl;
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOriginalSize(file.size);
    setCompressed(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImage(dataUrl);
      compressImage(dataUrl, qualityLevel);
    };
    reader.readAsDataURL(file);
  };

  const handleQualitySelect = (level: QualityLevel) => {
    setQualityLevel(level);
    if (image) compressImage(image, level);
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
  const savedPercent = originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;

  return (
    <ToolLayout
      toolId="img-comp"
      instructions={
        <ul className="list-disc pl-5 space-y-1">
          <li>Upload any image (JPEG, PNG, WebP).</li>
          <li>Choose a quality level: High keeps the best quality, Medium balances quality and size, Low gives the smallest file.</li>
          <li>The compressed image and its new file size are shown instantly.</li>
          <li>Click Download to save the compressed image as a JPEG.</li>
          <li>All processing happens in your browser — no data is sent to any server.</li>
        </ul>
      }
    >
      <div className="space-y-8">
        {/* Upload area */}
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
            {/* Quality selector — shown after upload */}
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
                        ${isActive ? opt.activeClass + " shadow-sm" : "border-border bg-card hover:border-muted-foreground/40"}`}
                    >
                      {isActive && (
                        <CheckCircle2
                          className={`absolute top-2 right-2 h-4 w-4 ${opt.color}`}
                        />
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

            {/* Before / After preview */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-medium text-muted-foreground text-sm">Original</h3>
                <div className="aspect-video rounded-xl overflow-hidden border bg-muted flex items-center justify-center">
                  <img src={image} alt="Original" className="object-contain w-full h-full" />
                </div>
                <p className="text-sm font-medium text-center">{formatSize(originalSize)}</p>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-muted-foreground text-sm flex items-center justify-between">
                  <span>Compressed</span>
                  {compressedSize > 0 && (
                    <span className="text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full text-xs font-bold">
                      -{savedPercent}% saved
                    </span>
                  )}
                </h3>
                <div className="aspect-video rounded-xl overflow-hidden border bg-muted flex items-center justify-center">
                  {isCompressing ? (
                    <p className="text-sm text-muted-foreground animate-pulse">Compressing…</p>
                  ) : (
                    compressed && <img src={compressed} alt="Compressed" className="object-contain w-full h-full" />
                  )}
                </div>
                {compressedSize > 0 && (
                  <div className="text-center">
                    <p className="text-sm font-bold text-primary">{formatSize(compressedSize)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Saved {formatSize(savedBytes)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setImage(null);
                  setCompressed(null);
                  setOriginalSize(0);
                  setCompressedSize(0);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
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
