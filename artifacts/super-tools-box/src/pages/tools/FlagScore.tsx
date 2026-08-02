import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Share2 } from "lucide-react";

const GREEN_FLAGS = [
  "Respects boundaries 🌿", "Good listener 👂", "Keeps promises ✅",
  "Honest and transparent 🪟", "Supports your goals 🎯", "Has a good sense of humour 😄",
  "Apologizes when wrong 🙏", "Values family & friends 👨‍👩‍👧", "Emotionally mature 💚",
  "Gives space when needed 🌱", "Remembers important dates 📅", "Kind to strangers 💛",
];

const RED_FLAGS = [
  "Always late ⏰", "Breaks promises 💔", "Avoids serious talks 🙉",
  "Too secretive 🔒", "Jealous & controlling 😤", "Doesn't listen 🙄",
  "Talks badly about exes 👿", "Disrespects family 🚨", "Gaslights you 🌪️",
  "Never apologizes 😒", "Inconsistent behavior 🎭", "Isolates you from friends 😰",
];

function pickRandom<T>(arr: T[], count: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  for (let i = 0; i < count && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

export default function FlagScore() {
  const [personName, setPersonName] = useState("");
  const [result, setResult] = useState<{ green: number; red: number; gFlags: string[]; rFlags: string[] } | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const green = Math.floor(Math.random() * 30) + 55;
    const red = 100 - green;
    const gCount = Math.min(4, Math.floor(green / 20));
    const rCount = Math.min(3, Math.floor(red / 20));
    setResult({
      green, red,
      gFlags: pickRandom(GREEN_FLAGS, gCount),
      rFlags: pickRandom(RED_FLAGS, rCount),
    });
  };

  const copyText = () => {
    if (!result) return;
    const name = personName || "This person";
    const text = `${name}'s Personality Flag Score 🏁\n\n🟩 Green Flags: ${result.green}%\n${result.gFlags.map((f) => `  ✓ ${f}`).join("\n")}\n\n🚩 Red Flags: ${result.red}%\n${result.rFlags.map((f) => `  ✗ ${f}`).join("\n")}\n\nGenerated at pockettoolskit.com`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWA = () => {
    if (!result) return;
    const name = personName || "This person";
    const text = `${name}'s Flag Score 🏁\n🟩 Green: ${result.green}% | 🚩 Red: ${result.red}%\n\nCheck yours at pockettoolskit.com`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <ToolLayout
      toolId="flag-score"
      instructions={
        <ul className="list-disc pl-5 space-y-1">
          <li>Enter a friend or partner's name for a fun personality flag score.</li>
          <li>This is purely for entertainment — not a real personality test! 😄</li>
          <li>Share the score card on WhatsApp for laughs.</li>
        </ul>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="personName">Person's Name</Label>
          <Input id="personName" placeholder="Enter your friend's name..." value={personName}
            onChange={(e) => setPersonName(e.target.value)} className="h-12" />
        </div>

        <Button size="lg" className="w-full gap-2" onClick={generate}>
          🚩 Generate Flag Score Card
        </Button>

        {result && (
          <div className="space-y-4">
            <div className="rounded-2xl border overflow-hidden">
              <div className="p-5 text-center bg-gradient-to-r from-green-500/10 to-red-500/10">
                <h3 className="font-bold text-xl mb-4">{personName || "Result"}'s Flag Score</h3>
                <div className="flex rounded-xl overflow-hidden h-8 mb-2">
                  <div className="bg-green-500 flex items-center justify-center text-white text-sm font-bold transition-all duration-700"
                    style={{ width: `${result.green}%` }}>
                    🟩 {result.green}%
                  </div>
                  <div className="bg-red-500 flex items-center justify-center text-white text-sm font-bold transition-all duration-700"
                    style={{ width: `${result.red}%` }}>
                    🚩 {result.red}%
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                <div className="p-4 space-y-2">
                  <p className="font-semibold text-green-600 text-sm">🟩 Green Flags ({result.green}%)</p>
                  {result.gFlags.map((f, i) => (
                    <p key={i} className="text-sm text-muted-foreground">✓ {f}</p>
                  ))}
                </div>
                <div className="p-4 space-y-2">
                  <p className="font-semibold text-red-500 text-sm">🚩 Red Flags ({result.red}%)</p>
                  {result.rFlags.map((f, i) => (
                    <p key={i} className="text-sm text-muted-foreground">✗ {f}</p>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-muted/30 text-center">
                <p className="text-xs text-muted-foreground italic">⚠️ For entertainment only — not a real personality assessment</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2" onClick={copyText}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy Score Card"}
              </Button>
              <Button className="flex-1 gap-2 bg-green-600 hover:bg-green-700" onClick={shareWA}>
                <Share2 className="h-4 w-4" /> Share on WhatsApp
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
