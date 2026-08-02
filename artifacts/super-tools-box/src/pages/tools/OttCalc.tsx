import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

const SPEEDS = [
  { label: "1x (Normal)", factor: 1.0 },
  { label: "1.25x Speed", factor: 1.25 },
  { label: "1.5x Speed", factor: 1.5 },
  { label: "1.75x Speed", factor: 1.75 },
  { label: "2x Speed", factor: 2.0 },
];

function fmt(mins: number) {
  const d = Math.floor(mins / (60 * 24));
  const h = Math.floor((mins % (60 * 24)) / 60);
  const m = Math.round(mins % 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

export default function OttCalc() {
  const [episodes, setEpisodes] = useState("");
  const [duration, setDuration] = useState("");
  const [copied, setCopied] = useState(false);

  const eps = parseFloat(episodes) || 0;
  const dur = parseFloat(duration) || 0;
  const totalMins = eps * dur;

  const hasResult = eps > 0 && dur > 0;

  const resultText = hasResult
    ? `Binge Watch Estimate:\n• Total Episodes: ${eps}\n• Episode Duration: ${dur} min\n• Total Watch Time: ${fmt(totalMins)}\n\n` +
      SPEEDS.slice(1).map((s) => `• At ${s.label}: ${fmt(totalMins / s.factor)} (save ${fmt(totalMins - totalMins / s.factor)})`).join("\n")
    : "";

  const copy = () => {
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const POPULAR = [
    { name: "Breaking Bad", eps: 62, dur: 47 },
    { name: "Money Heist", eps: 41, dur: 50 },
    { name: "Squid Game S1", eps: 9, dur: 55 },
    { name: "Stranger Things", eps: 34, dur: 50 },
    { name: "Friends (All)", eps: 236, dur: 22 },
  ];

  return (
    <ToolLayout
      toolId="ott-calc"
      instructions={
        <ul className="list-disc pl-5 space-y-1">
          <li>Enter total episodes and average episode duration.</li>
          <li>See time saved at different playback speeds.</li>
          <li>Click popular shows to auto-fill.</li>
        </ul>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Quick-fill popular shows</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR.map((s) => (
              <button key={s.name} onClick={() => { setEpisodes(String(s.eps)); setDuration(String(s.dur)); }}
                className="px-3 py-1.5 rounded-full text-xs font-medium border bg-muted hover:bg-muted/70 transition-colors">
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="eps">Total Episodes</Label>
            <Input id="eps" type="number" min="1" placeholder="e.g. 62" value={episodes} onChange={(e) => setEpisodes(e.target.value)} className="h-12 text-lg" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dur">Avg Episode Duration (minutes)</Label>
            <Input id="dur" type="number" min="1" placeholder="e.g. 45" value={duration} onChange={(e) => setDuration(e.target.value)} className="h-12 text-lg" />
          </div>
        </div>

        {hasResult && (
          <div className="space-y-4">
            <div className="grid gap-3">
              {SPEEDS.map((s) => {
                const t = totalMins / s.factor;
                const saved = totalMins - t;
                const isNormal = s.factor === 1;
                return (
                  <div key={s.label} className={`flex items-center justify-between p-4 rounded-xl border ${isNormal ? "bg-primary/10 border-primary/30" : "bg-muted/40"}`}>
                    <div>
                      <p className="font-semibold text-sm">{s.label}</p>
                      {!isNormal && <p className="text-xs text-green-600">Save {fmt(saved)}</p>}
                    </div>
                    <p className={`text-xl font-bold ${isNormal ? "text-primary" : ""}`}>{fmt(t)}</p>
                  </div>
                );
              })}
            </div>

            <Button variant="outline" className="w-full gap-2" onClick={copy}>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy Watch-Time Estimate"}
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
