import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

// Unicode font transformer helpers
const shift = (char: string, lower: number, upper: number) => {
  const c = char.charCodeAt(0);
  if (c >= 97 && c <= 122) return String.fromCodePoint(c - 97 + lower);
  if (c >= 65 && c <= 90) return String.fromCodePoint(c - 65 + upper);
  return char;
};

const STYLES: { name: string; fn: (s: string) => string }[] = [
  { name: "𝐁𝐨𝐥𝐝", fn: (s) => [...s].map((c) => shift(c, 0x1D41A, 0x1D400)).join("") },
  { name: "𝘐𝘵𝘢𝘭𝘪𝘤", fn: (s) => [...s].map((c) => { const lc = c.charCodeAt(0); if (lc >= 97 && lc <= 122) return String.fromCodePoint(lc - 97 + 0x1D622); if (lc >= 65 && lc <= 90) return String.fromCodePoint(lc - 65 + 0x1D608); return c; }).join("") },
  { name: "𝑺𝒄𝒓𝒊𝒑𝒕", fn: (s) => [...s].map((c) => shift(c, 0x1D4EA, 0x1D4D0)).join("") },
  { name: "𝕯𝖔𝖚𝖇𝖑𝖊", fn: (s) => [...s].map((c) => shift(c, 0x1D552, 0x1D538)).join("") },
  { name: "𝔊𝔬𝔱𝔥𝔦𝔠", fn: (s) => [...s].map((c) => shift(c, 0x1D586, 0x1D56C)).join("") },
  { name: "🄼🄾🄽🄾", fn: (s) => [...s].map((c) => shift(c, 0x1D68A, 0x1D670)).join("") },
  { name: "Ⓒⓘⓡⓒⓛⓔ", fn: (s) => [...s].map((c) => { const lc = c.charCodeAt(0); if (lc >= 97 && lc <= 122) return String.fromCodePoint(lc - 97 + 0x24D0); if (lc >= 65 && lc <= 90) return String.fromCodePoint(lc - 65 + 0x24B6); return c; }).join("") },
  { name: "S̶t̶r̶i̶k̶e̶", fn: (s) => [...s].map((c) => c + "\u0336").join("") },
  { name: "Ṡ̈p̈ȧ̈c̈ė̈d̈", fn: (s) => [...s].join(" ") },
  { name: "S̲u̲b̲l̲i̲n̲e̲", fn: (s) => [...s].map((c) => c + "\u0332").join("") },
  { name: "ꜱᴍᴀʟʟ ᴄᴀᴘꜱ", fn: (s) => s.toUpperCase().replace(/[A-Z]/g, (c) => "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘQʀꜱᴛᴜᴠᴡxʏᴢ"["ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(c)] || c) },
  { name: "ʇxǝʇ pǝddᴉlɟ", fn: (s) => [...s].reverse().map((c) => "ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz"["abcdefghijklmnopqrstuvwxyz".indexOf(c.toLowerCase())] || c).join("") },
];

export default function FancyFont() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <ToolLayout
      toolId="fancy-font"
      instructions={
        <ul className="list-disc pl-5">
          <li>Type any text in the box — all 12 styles update live.</li>
          <li>Click the Copy button next to any style to copy it to clipboard.</li>
          <li>Paste the copied text into Instagram, WhatsApp, Twitter, etc.</li>
        </ul>
      }
    >
      <div className="space-y-6 max-w-xl mx-auto">
        <div className="space-y-2">
          <Label htmlFor="fancy-input">Your Text</Label>
          <Input
            id="fancy-input"
            placeholder="Type here to see all styles…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-12 text-lg"
            autoComplete="off"
          />
        </div>

        <div className="space-y-3">
          {STYLES.map((style, idx) => {
            const converted = input ? style.fn(input) : style.fn("Sample");
            return (
              <div key={idx} className="flex items-center justify-between gap-3 bg-muted rounded-xl px-4 py-3 border">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">{style.name}</p>
                  <p className="text-base break-all">{converted}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 gap-1"
                  onClick={() => handleCopy(input ? converted : converted, idx)}
                  disabled={!input}
                >
                  {copied === idx ? <><Check className="h-3.5 w-3.5 text-green-500" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </ToolLayout>
  );
}
