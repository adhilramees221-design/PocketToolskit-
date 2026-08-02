import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";

const PRESETS = [
  { label: "500 MB", val: 500 },
  { label: "1 GB", val: 1024 },
  { label: "1.5 GB", val: 1536 },
  { label: "2 GB", val: 2048 },
  { label: "3 GB", val: 3072 },
];

const RATES = [
  { label: "Instagram Reels / TikTok", icon: "🎬", mb: 250 },
  { label: "YouTube (720p)", icon: "▶️", mb: 500 },
  { label: "YouTube (480p)", icon: "▶️", mb: 250 },
  { label: "Netflix SD", icon: "🎬", mb: 300 },
  { label: "Netflix HD", icon: "🎬", mb: 700 },
  { label: "WhatsApp Video Call", icon: "📞", mb: 100 },
  { label: "Spotify (Normal)", icon: "🎵", mb: 40 },
  { label: "Spotify (High Quality)", icon: "🎵", mb: 72 },
];

export default function DataEstimator() {
  const [dataMb, setDataMb] = useState("");
  const [unit, setUnit] = useState<"MB" | "GB">("MB");
  const [copied, setCopied] = useState(false);

  const totalMb = unit === "GB" ? (parseFloat(dataMb) || 0) * 1024 : parseFloat(dataMb) || 0;

  const copy = () => {
    if (!totalMb) return;
    const text = RATES.map((r) => {
      const hrs = (totalMb / r.mb).toFixed(1);
      const mins = Math.round(totalMb / r.mb * 60);
      return `${r.label}: ~${hrs} hrs (${mins} mins)`;
    }).join("\n");
    navigator.clipboard.writeText(`Data: ${dataMb}${unit}\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      toolId="data-est"
      instructions={
        <ul className="list-disc pl-5 space-y-1">
          <li>Enter your remaining mobile data balance in MB or GB.</li>
          <li>See how many hours you can stream on different platforms.</li>
          <li>Based on average bitrates; actual usage may vary by quality setting.</li>
        </ul>
      }
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Remaining Data Balance</Label>
          <div className="flex gap-2">
            <Input type="number" min="0" placeholder="Enter amount..." value={dataMb} onChange={(e) => setDataMb(e.target.value)} className="flex-1 h-12 text-lg" />
            <div className="flex rounded-xl overflow-hidden border">
              {(["MB", "GB"] as const).map((u) => (
                <button key={u} onClick={() => setUnit(u)}
                  className={`px-5 font-semibold text-sm transition-colors ${unit === u ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                  {u}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p.label} onClick={() => { setDataMb(unit === "GB" ? String(p.val / 1024) : String(p.val)); }}
                className="px-3 py-1.5 rounded-full text-xs font-medium border bg-muted hover:bg-muted/70 transition-colors">
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {totalMb > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Streaming Estimates</h3>
              <Button size="sm" variant="outline" onClick={copy} className="gap-1 text-xs">
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy All"}
              </Button>
            </div>
            <div className="grid gap-2">
              {RATES.map((r) => {
                const hrs = totalMb / r.mb;
                const h = Math.floor(hrs);
                const m = Math.round((hrs - h) * 60);
                const pct = Math.min(100, (hrs / 12) * 100);
                return (
                  <div key={r.label} className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
                    <span className="text-xl w-7">{r.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium truncate">{r.label}</span>
                        <span className="text-sm font-bold text-primary shrink-0 ml-2">{h > 0 ? `${h}h ${m}m` : `${m} min`}</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
