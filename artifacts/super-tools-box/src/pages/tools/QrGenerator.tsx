import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function QrGenerator() {
  const [text, setText] = useState("");
  const [color, setColor] = useState("#000000");
  const svgRef = useRef<SVGSVGElement>(null);

  const handleDownload = () => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    // Scale up for better resolution
    const size = 1024;
    canvas.width = size;
    canvas.height = size;
    
    img.onload = () => {
      if (ctx) {
        // Add white background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `qrcode_${Date.now()}.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <ToolLayout toolId="qr-code" 
      instructions={
        <ul className="list-disc pl-5">
          <li>Enter any URL, text, email, or phone number in the input box.</li>
          <li>The QR code updates in real-time as you type.</li>
          <li>Customize the QR code color if desired.</li>
          <li>Click 'Download PNG' to save a high-resolution image of your QR code.</li>
        </ul>
      }
    >
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className="space-y-6">
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
          <div className="bg-white p-6 rounded-xl shadow-md border inline-block">
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
