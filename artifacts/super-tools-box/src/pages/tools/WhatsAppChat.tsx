import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink } from "lucide-react";

const COUNTRY_CODES = [
  { code: "91", name: "🇮🇳 India (+91)" },
  { code: "1", name: "🇺🇸 USA/Canada (+1)" },
  { code: "44", name: "🇬🇧 UK (+44)" },
  { code: "971", name: "🇦🇪 UAE (+971)" },
  { code: "966", name: "🇸🇦 Saudi Arabia (+966)" },
  { code: "60", name: "🇲🇾 Malaysia (+60)" },
  { code: "65", name: "🇸🇬 Singapore (+65)" },
  { code: "61", name: "🇦🇺 Australia (+61)" },
  { code: "49", name: "🇩🇪 Germany (+49)" },
  { code: "33", name: "🇫🇷 France (+33)" },
];

export default function WhatsAppChat() {
  const [countryCode, setCountryCode] = useState("91");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleOpen = () => {
    const digits = phone.replace(/\D/g, "");
    if (!digits || digits.length < 6) {
      setError("Please enter a valid phone number.");
      return;
    }
    setError("");
    const full = countryCode + digits;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${full}${encoded ? "?text=" + encoded : ""}`, "_blank", "noopener");
  };

  return (
    <ToolLayout
      toolId="wa-chat"
      instructions={
        <ul className="list-disc pl-5">
          <li>Select country code and enter phone number (no need to save the contact).</li>
          <li>Optionally type a pre-filled message.</li>
          <li>Click "Open Chat" — WhatsApp will open directly in a new tab.</li>
        </ul>
      }
    >
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Label>Country</Label>
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="98765 43210"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setError(""); }}
            className="h-12 text-lg tracking-widest"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="msg">Pre-filled Message <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <textarea
            id="msg"
            rows={3}
            placeholder="Hi! I got your number from..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        {phone && (
          <div className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2 font-mono">
            wa.me/{countryCode}{phone.replace(/\D/g, "")}
          </div>
        )}

        <Button onClick={handleOpen} size="lg" className="w-full gap-2 text-base font-semibold bg-[#25D366] hover:bg-[#1ebe5a] text-white">
          <ExternalLink className="h-5 w-5" /> Open WhatsApp Chat
        </Button>
      </div>
    </ToolLayout>
  );
}
