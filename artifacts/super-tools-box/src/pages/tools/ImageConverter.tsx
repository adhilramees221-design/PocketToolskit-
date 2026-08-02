import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";

type Format = { label: string; mime: string; ext: string };
const FORMATS: Format[] = [
  { label: "WebP", mime: "image/webp", ext: "webp" },
  { label: "PNG", mime: "image/png", ext: "png" },
  { label: "JPG", mime: "image/jpeg", ext: "jpg" },
];

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [quality, setQuality] = useState(0.92);
  const imgRef = useRef<HTMLImageElement>(null);

  const loadFile = (f: File) => {
    setFile(f);
    setDims(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const onImgLoad = useCallback(() => {
    if (imgRef.current) {
      setDims({ w: imgRef.current.naturalWidth, h: imgRef.current.naturalHeight });
    }
  }, []);

  const convert = (fmt: Format) => {
    if (!imgRef.current || !file) return;
    const img = imgRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    if (fmt.mime === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    const dataUrl = canvas.toDataURL(fmt.mime, quality);
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${baseName}.${fmt.ext}`;
    a.click();
  };

  const origSizeKb = file ? Math.round(file.size / 1024) : 0;

  return (
    <ToolLayout
      toolId="img-conv"
      instructions={
        <ul className="list-disc pl-5 space-y-1">
          <li>Upload any image (JPG, PNG, WebP, GIF, BMP).</li>
          <li>Choose the output format and click to download instantly.</li>
          <li>WebP is ideal for websites (smallest file size). PNG for transparency. JPG for photos.</li>
          <li>100% client-side — your image never leaves your device.</li>
        </ul>
      }
    >
      <div className="space-y-6">
        <div
          className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:bg-muted/40 transition-colors"
          onClick={() => document.getElementById("imgConvInput")?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f?.type.startsWith("image/")) loadFile(f);
          }}
        >
          <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Click or drag &amp; drop an image (JPG, PNG, WebP, GIF, BMP)</p>
          <input id="imgConvInput" type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); }} />
        </div>

        {preview && (
          <>
            <img
              ref={imgRef}
              src={preview}
              alt="preview"
              className="max-h-48 rounded-xl mx-auto border shadow-sm"
              onLoad={onImgLoad}
            />
            {dims && (
              <p className="text-center text-sm text-muted-foreground">
                {file?.name} &nbsp;·&nbsp; {origSizeKb} KB &nbsp;·&nbsp; {dims.w}×{dims.h}px
              </p>
            )}
          </>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Output Quality: {Math.round(quality * 100)}%</label>
          <input
            type="range" min={0.5} max={1} step={0.01} value={quality}
            onChange={(e) => setQuality(parseFloat(e.target.value))}
            className="w-full accent-primary"
          />
          <p className="text-xs text-muted-foreground">Lower quality = smaller file size (applies to JPG &amp; WebP)</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {FORMATS.map((fmt) => (
            <Button
              key={fmt.ext}
              variant="outline"
              disabled={!file || !dims}
              onClick={() => convert(fmt)}
              className="gap-2 h-14 flex-col text-xs"
            >
              <Download className="h-4 w-4" />
              <span>Convert to {fmt.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
