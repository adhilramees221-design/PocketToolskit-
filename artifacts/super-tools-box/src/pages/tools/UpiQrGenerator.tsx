import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QRCodeSVG } from "qrcode.react";
import { Download, Copy, Check } from "lucide-react";

export default function UpiQrGenerator() {
  const [upiId, setUpiId] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}${amount ? `&am=${amount}` : ""}&cu=INR${note ? `&tn=${encodeURIComponent(note)}` : ""}`;

  const generate = () => {
    if (!upiId.trim()) return;
    setGenerated(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(upiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const canvas = document.createElement("canvas");
    canvas.width = 300; canvas.height = 300;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 300, 300);
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 300, 300);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `upi-qr-${upiId}.png`;
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <ToolLayout
      toolId="upi-qr"
      instructions={
        <ul className="list-disc pl-5 space-y-1">
          <li>Enter your UPI ID (e.g. name@okaxis, phone@ybl).</li>
          <li>Amount is optional – leave blank for open-amount payments.</li>
          <li>Works with GPay, PhonePe, Paytm, BHIM, and all UPI apps.</li>
          <li>Download the QR or copy the UPI payment link for sharing.</li>
        </ul>
      }
    >
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="upiId">UPI ID *</Label>
            <Input id="upiId" placeholder="yourname@okaxis" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="upiName">Payee Name</Label>
            <Input id="upiName" placeholder="Your Name / Business Name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="upiAmt">Amount (₹) — Optional</Label>
            <Input id="upiAmt" type="number" min="0" placeholder="Leave blank for open amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="upiNote">Payment Note — Optional</Label>
            <Input id="upiNote" placeholder="e.g. Invoice #123, Birthday Gift" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <Button className="w-full" onClick={generate} disabled={!upiId.trim()}>
            Generate UPI QR Code
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center gap-4">
          {generated ? (
            <>
              <div className="p-4 bg-white rounded-2xl border shadow-md">
                <QRCodeSVG ref={svgRef} value={upiUrl} size={200} includeMargin />
              </div>
              {name && <p className="font-semibold text-center">{name}</p>}
              {amount && <p className="text-2xl font-bold text-primary">₹{amount}</p>}
              <p className="text-xs text-muted-foreground text-center break-all max-w-xs">{upiId}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadQR} className="gap-1">
                  <Download className="h-4 w-4" /> Download QR
                </Button>
                <Button variant="outline" size="sm" onClick={copyLink} className="gap-1">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy UPI Link"}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground">
              <div className="w-48 h-48 border-2 border-dashed border-border rounded-2xl flex items-center justify-center mx-auto mb-3">
                <p className="text-sm px-4">QR code will appear here</p>
              </div>
              <p className="text-xs">Compatible with GPay, PhonePe, Paytm &amp; all UPI apps</p>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
