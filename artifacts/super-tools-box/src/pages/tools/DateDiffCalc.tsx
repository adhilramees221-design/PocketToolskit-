import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

function isWeekend(d: Date) {
  const day = d.getDay();
  return day === 0 || day === 6;
}

function workingDays(start: Date, end: Date): number {
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    if (!isWeekend(cur)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export default function DateDiffCalc() {
  const today = new Date().toISOString().split("T")[0];
  const [d1, setD1] = useState(today);
  const [d2, setD2] = useState(today);
  const [copied, setCopied] = useState(false);

  const start = new Date(d1);
  const end = new Date(d2);
  const diff = Math.abs(end.getTime() - start.getTime());
  const totalDays = Math.round(diff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(totalDays / 7);
  const remainDays = totalDays % 7;
  const months = Math.floor(totalDays / 30.44);
  const years = (totalDays / 365.25).toFixed(2);
  const workDays = d1 && d2 ? workingDays(start < end ? start : end, start < end ? end : start) : 0;
  const weekends = totalDays - workDays;

  const hasResult = d1 && d2 && totalDays >= 0;

  const resultText = hasResult
    ? `Date 1: ${d1}\nDate 2: ${d2}\n\nResults:\n• Total Days: ${totalDays}\n• Weeks: ${weeks} weeks ${remainDays} days\n• Months (approx): ${months}\n• Years (approx): ${years}\n• Working Days (Mon-Fri): ${workDays}\n• Weekends: ${weekends}`
    : "";

  const copy = () => {
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const swapDates = () => { setD1(d2); setD2(d1); };

  return (
    <ToolLayout
      toolId="date-diff"
      instructions={
        <ul className="list-disc pl-5 space-y-1">
          <li>Select any two dates to calculate the difference.</li>
          <li>Working days count only Mon–Fri (no holidays).</li>
          <li>Use "Set Today" to quickly set the current date.</li>
        </ul>
      }
    >
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="d1">Start Date</Label>
            <Input id="d1" type="date" value={d1} onChange={(e) => setD1(e.target.value)} className="h-12" />
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setD1(today)}>Set Today</Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="d2">End Date</Label>
            <Input id="d2" type="date" value={d2} onChange={(e) => setD2(e.target.value)} className="h-12" />
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setD2(today)}>Set Today</Button>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={swapDates} className="text-xs">⇄ Swap Dates</Button>

        {hasResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: "Total Days", val: totalDays.toString(), color: "bg-primary/10 border-primary/30" },
                { label: "Weeks + Days", val: `${weeks}w ${remainDays}d`, color: "bg-muted" },
                { label: "Approx. Months", val: months.toString(), color: "bg-muted" },
                { label: "Approx. Years", val: years, color: "bg-muted" },
                { label: "Working Days", val: workDays.toString(), color: "bg-green-500/10 border-green-500/30" },
                { label: "Weekends", val: weekends.toString(), color: "bg-amber-500/10 border-amber-500/30" },
              ].map((r) => (
                <div key={r.label} className={`rounded-xl border p-4 text-center ${r.color}`}>
                  <p className="text-xs text-muted-foreground mb-1">{r.label}</p>
                  <p className="text-2xl font-bold">{r.val}</p>
                </div>
              ))}
            </div>

            {totalDays > 0 && (
              <p className="text-sm text-muted-foreground text-center">
                {start < end ? `${d2} is ${totalDays} days after ${d1}` : start > end ? `${d1} is ${totalDays} days after ${d2}` : "Both dates are the same"}
              </p>
            )}

            <Button variant="outline" className="w-full gap-2" onClick={copy}>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy Result"}
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
