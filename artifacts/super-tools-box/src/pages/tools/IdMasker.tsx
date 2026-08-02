import { useRef, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Upload, Download, Square, RotateCcw } from "lucide-react";

export default function IdMasker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement | null>(null);
  const historyRef = useRef<ImageData[]>([]);

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
        historyRef.current = [];
        setImgLoaded(true);
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  };

  const getCanvasPos = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const saveHistory = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    historyRef.current = [...historyRef.current.slice(-9), ctx.getImageData(0, 0, canvas.width, canvas.height)];
  };

  // Mouse events
  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imgLoaded) return;
    saveHistory();
    setIsDragging(true);
    setStartPos(getCanvasPos(e.clientX, e.clientY));
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !imgRef.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
    // Redraw all history masks first (simplified: just show live preview)
    const curr = getCanvasPos(e.clientX, e.clientY);
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(startPos.x, startPos.y, curr.x - startPos.x, curr.y - startPos.y);
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const curr = getCanvasPos(e.clientX, e.clientY);
    if (imgRef.current) ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
    // Replay saved state + new box
    if (historyRef.current.length > 0) {
      ctx.putImageData(historyRef.current[historyRef.current.length - 1], 0, 0);
    }
    ctx.fillStyle = "#000000";
    ctx.fillRect(startPos.x, startPos.y, curr.x - startPos.x, curr.y - startPos.y);
    // Save the new state
    historyRef.current = [...historyRef.current, ctx.getImageData(0, 0, canvas.width, canvas.height)];
  };

  // Touch events for mobile
  const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!imgLoaded) return;
    e.preventDefault();
    saveHistory();
    setIsDragging(true);
    const touch = e.touches[0];
    setStartPos(getCanvasPos(touch.clientX, touch.clientY));
  };

  const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || !imgRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const touch = e.touches[0];
    const curr = getCanvasPos(touch.clientX, touch.clientY);
    // Show live preview
    if (historyRef.current.length > 0) {
      ctx.putImageData(historyRef.current[historyRef.current.length - 1], 0, 0);
    } else {
      ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
    }
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(startPos.x, startPos.y, curr.x - startPos.x, curr.y - startPos.y);
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    setIsDragging(false);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const touch = e.changedTouches[0];
    const curr = getCanvasPos(touch.clientX, touch.clientY);
    if (historyRef.current.length > 0) {
      ctx.putImageData(historyRef.current[historyRef.current.length - 1], 0, 0);
    }
    ctx.fillStyle = "#000000";
    ctx.fillRect(startPos.x, startPos.y, curr.x - startPos.x, curr.y - startPos.y);
    historyRef.current = [...historyRef.current, ctx.getImageData(0, 0, canvas.width, canvas.height)];
  };

  const undo = () => {
    if (historyRef.current.length < 2) {
      // Reset to original
      if (imgRef.current) {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
        historyRef.current = [];
      }
      return;
    }
    historyRef.current = historyRef.current.slice(0, -1);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.putImageData(historyRef.current[historyRef.current.length - 1], 0, 0);
  };

  const addAutoMask = () => {
    if (!imgRef.current) return;
    saveHistory();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    if (historyRef.current.length > 0) {
      ctx.putImageData(historyRef.current[historyRef.current.length - 1], 0, 0);
    } else {
      ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
    }
    ctx.fillStyle = "#000000";
    // Mask Aadhaar number area (bottom-center)
    ctx.fillRect(canvas.width * 0.1, canvas.height * 0.63, canvas.width * 0.55, canvas.height * 0.13);
    historyRef.current = [...historyRef.current, ctx.getImageData(0, 0, canvas.width, canvas.height)];
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
          <li><strong>Desktop:</strong> Click and drag on the image to draw a black redaction box.</li>
          <li><strong>Mobile:</strong> Touch and drag on the image to draw a blackout box.</li>
          <li>Use "Auto-Mask" to quickly hide the Aadhaar number area automatically.</li>
          <li>Use "Undo" to remove the last mask. Download to save. <strong>100% private — no server upload.</strong></li>
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
          <p className="text-sm text-muted-foreground font-medium">Click or drag &amp; drop your ID image here</p>
          <p className="text-xs text-muted-foreground mt-1">Aadhaar / PAN Card / Passport / Voter ID</p>
          <input id="idFileInput" type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) loadImage(f); }} />
        </div>

        {imgLoaded && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={addAutoMask} className="gap-2">
              <Square className="h-4 w-4" /> Auto-Mask Number
            </Button>
            <Button variant="outline" onClick={undo} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Undo
            </Button>
            <Button onClick={download} className="gap-2">
              <Download className="h-4 w-4" /> Download Masked Image
            </Button>
          </div>
        )}

        {imgLoaded && (
          <p className="text-xs text-muted-foreground">
            💡 <strong>Desktop:</strong> Click &amp; drag to draw boxes &nbsp;|&nbsp; <strong>Mobile:</strong> Touch &amp; drag to redact
          </p>
        )}

        <canvas
          ref={canvasRef}
          className={`max-w-full rounded-xl border shadow-sm touch-none ${imgLoaded ? "cursor-crosshair" : "hidden"}`}
          style={{ maxHeight: "500px" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={() => setIsDragging(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />
      </div>
    </ToolLayout>
  );
}
