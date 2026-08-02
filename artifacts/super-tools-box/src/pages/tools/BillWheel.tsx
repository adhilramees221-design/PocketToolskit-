import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Share2 } from "lucide-react";

const SCENARIOS = [
  { label: "Who Pays the Bill? 💳", template: (n: string) => `${n} pays the bill today! 💸🎉` },
  { label: "Who Does Dishes? 🍽️", template: (n: string) => `${n} washes the dishes today! 🫧🎉` },
  { label: "Who Buys Tea/Coffee? ☕", template: (n: string) => `${n} buys the tea/coffee today! ☕🎉` },
  { label: "Who Does Chores? 🧹", template: (n: string) => `${n} does the chores today! 🧹🎉` },
  { label: "Who Orders Food? 🛵", template: (n: string) => `${n} orders food today! 📱🎉` },
];

export default function BillWheel() {
  const [names, setNames] = useState("");
  const [scenario, setScenario] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [copied, setCopied] = useState(false);

  const nameList = names.split(",").map((n) => n.trim()).filter(Boolean);

  const spin = () => {
    if (nameList.length < 2) return;
    setSpinning(true);
    setResult(null);
    let count = 0;
    const interval = setInterval(() => {
      const picked = nameList[Math.floor(Math.random() * nameList.length)];
      setResult(SCENARIOS[scenario].template(picked));
      count++;
      if (count > 20) {
        clearInterval(interval);
        setSpinning(false);
      }
    }, 80);
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWA = () => {
    if (!result) return;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${result}\n\nDecided fairly at pockettoolskit.com 🎡`)}`, "_blank");
  };

  return (
    <ToolLayout
      toolId="bill-wheel"
      instructions={
        <ul className="list-disc pl-5 space-y-1">
          <li>Enter names separated by commas (minimum 2 people).</li>
          <li>Choose a scenario, then spin to pick randomly.</li>
          <li>Share the result on WhatsApp to settle disputes fairly! 😄</li>
        </ul>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="names">Names (comma-separated)</Label>
          <Input id="names" placeholder="Arun, Rahul, Priya, Mohammed, Lakshmi" value={names}
            onChange={(e) => setNames(e.target.value)} className="h-12" />
          {nameList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {nameList.map((n, i) => (
                <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">{n}</span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Scenario</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SCENARIOS.map((s, i) => (
              <button key={i} onClick={() => setScenario(i)}
                className={`text-left p-3 rounded-xl border text-sm font-medium transition-colors
                  ${scenario === i ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:bg-muted/70"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center space-y-4">
          <Button size="lg" onClick={spin} disabled={spinning || nameList.length < 2}
            className="rounded-full px-10 h-14 text-base shadow-lg gap-2">
            {spinning ? "🎯 Picking..." : "🎯 Pick Randomly!"}
          </Button>
          {nameList.length < 2 && names && (
            <p className="text-xs text-destructive">Add at least 2 names</p>
          )}

          {result && !spinning && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 space-y-3">
              <p className="text-xl font-bold">{result}</p>
              <div className="flex gap-2 justify-center">
                <Button size="sm" variant="outline" onClick={copy} className="gap-1">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy Result"}
                </Button>
                <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700" onClick={shareWA}>
                  <Share2 className="h-4 w-4" /> Share on WhatsApp
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
