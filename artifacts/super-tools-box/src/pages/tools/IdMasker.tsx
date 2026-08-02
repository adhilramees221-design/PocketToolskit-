import { useRef, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Upload, Download, Square } from "lucide-react";

export default function IdMasker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement | null>(null);

  const loadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        const canvas = canvasRef.current!;
        const maxW = 640;
        const scale = img.width > maxW ? maxW / img.width : 1;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setImgLoaded(true);
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imgLoaded) return;
    setIsDragging(true);
    setStartPos(getPos(e));
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !imgRef.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    // Redraw image
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
    const curr = getPos(e);
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(startPos.x, startPos.y, curr.x - startPos.x, curr.y - startPos.y);
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !imgRef.current) return;
    setIsDragging(false);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const curr = getPos(e);
    ctx.fillStyle = "#000000";
    ctx.fillRect(startPos.x, startPos.y, curr.x - startPos.x, curr.y - startPos.y);
  };

  const addAutoMask = () => {
    if (!imgRef.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    // Mask bottom portion (where Aadhaar numbers usually appear)
    ctx.fillRect(canvas.width * 0.15, canvas.height * 0.65, canvas.width * 0.5, canvas.height * 0.14);
  };

  const download = () => {
    const canvas = canvasRef.current!;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "masked-id.png";
    a.click();
  };

  return (
    <ToolLayout
      toolId="id-mask"
      instructions={
        <ul className="list-disc pl-5 space-y-1">
          <li>Upload your Aadhaar, PAN, Passport, or Voter ID image.</li>
          <li>Click and drag on the image to draw a black redaction box over sensitive numbers.</li>
          <li>Use "Auto-Mask" to quickly hide the Aadhaar number area.</li>
          <li>Click "Download Masked Image" to save. <strong>100% private – no upload to servers.</strong></li>
        </ul>
      }
    >
      <div className="space-y-5">
        <div
          className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:bg-muted/40 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) loadImage(f); }}
          onClick={() => document.getElementById("idFileInput")?.click()}
        >
          <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Click or drag &amp; drop ID image here (Aadhaar / PAN / Passport)</p>
          <input id="idFileInput" type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadImage(f); }} />
        </div>

        {imgLoaded && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={addAutoMask} className="gap-2">
              <Square className="h-4 w-4" /> Auto-Mask Aadhaar Number
            </Button>
            <Button onClick={download} className="gap-2">
              <Download className="h-4 w-4" /> Download Masked Image
            </Button>
          </div>
        )}

        {imgLoaded && (
          <p className="text-xs text-muted-foreground">💡 Click &amp; drag on the image to draw custom blackout boxes</p>
        )}

        <canvas
          ref={canvasRef}
          className={`max-w-full rounded-xl border shadow-sm ${imgLoaded ? "cursor-crosshair" : "hidden"}`}
          style={{ maxHeight: "500px" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        />
      </div>
    </ToolLayout>
  );
}
