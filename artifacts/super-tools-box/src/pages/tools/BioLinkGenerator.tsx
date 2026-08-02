import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, ExternalLink } from "lucide-react";

export default function BioLinkGenerator() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [link1Label, setLink1Label] = useState("Instagram");
  const [link1Url, setLink1Url] = useState("");
  const [link2Label, setLink2Label] = useState("YouTube");
  const [link2Url, setLink2Url] = useState("");
  const [link3Label, setLink3Label] = useState("Website");
  const [link3Url, setLink3Url] = useState("");
  const [upiId, setUpiId] = useState("");
  const [preview, setPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const links = [
    { label: link1Label, url: link1Url },
    { label: link2Label, url: link2Url },
    { label: link3Label, url: link3Url },
  ].filter((l) => l.url.trim());

  const upiUrl = upiId ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}` : "";

  const copyText = () => {
    const text = [
      name, role, bio,
      ...links.map((l) => `${l.label}: ${l.url}`),
      upiId ? `UPI: ${upiId}` : "",
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      toolId="bio-link"
      instructions={
        <ul className="list-disc pl-5 space-y-1">
          <li>Fill in your name, role, and up to 3 social links.</li>
          <li>Add your UPI ID to auto-generate a payment QR code on your card.</li>
          <li>Click "Preview Card" to see your live bio card.</li>
          <li>Copy the text details to share on WhatsApp or use as a digital visiting card.</li>
        </ul>
      }
    >
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Profile Info</h3>
            <div className="space-y-2">
              <Label>Your Name</Label>
              <Input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Role / Title</Label>
              <Input placeholder="Freelance Designer / Developer" value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Short Bio</Label>
              <Input placeholder="Building awesome things 🚀" value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>UPI ID (for Payment QR)</Label>
              <Input placeholder="name@okaxis" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Links</h3>
            {[
              { label: link1Label, setLabel: setLink1Label, url: link1Url, setUrl: setLink1Url },
              { label: link2Label, setLabel: setLink2Label, url: link2Url, setUrl: setLink2Url },
              { label: link3Label, setLabel: setLink3Label, url: link3Url, setUrl: setLink3Url },
            ].map((l, i) => (
              <div key={i} className="flex gap-2">
                <Input className="w-28 shrink-0" placeholder="Label" value={l.label} onChange={(e) => l.setLabel(e.target.value)} />
                <Input className="flex-1" placeholder="https://..." value={l.url} onChange={(e) => l.setUrl(e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setPreview(true)} disabled={!name}>Preview Bio Card</Button>
          <Button variant="outline" onClick={copyText} disabled={!name} className="gap-1">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy Details"}
          </Button>
        </div>

        {preview && name && (
          <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-6 text-center space-y-4 max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto text-white text-2xl font-bold">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-xl">{name}</h3>
              {role && <p className="text-sm text-muted-foreground">{role}</p>}
              {bio && <p className="text-sm mt-1">{bio}</p>}
            </div>
            {links.length > 0 && (
              <div className="space-y-2">
                {links.map((l) => (
                  <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition-opacity">
                    <ExternalLink className="h-4 w-4" /> {l.label}
                  </a>
                ))}
              </div>
            )}
            {upiId && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Pay via UPI</p>
                <div className="bg-white rounded-xl p-3 inline-block shadow-sm">
                  <QRCodeSVG value={upiUrl} size={100} />
                </div>
                <p className="text-xs text-muted-foreground">{upiId}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
