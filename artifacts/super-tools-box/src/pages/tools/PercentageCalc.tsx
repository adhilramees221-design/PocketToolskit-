import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

type Mode = "discount" | "markup" | "percent_of" | "what_percent";

const MODES: { id: Mode; label: string }[] = [
  { id: "discount", label: "Discount / Sale Price" },
  { id: "markup", label: "Price Markup" },
  { id: "percent_of", label: "X% of a Number" },
  { id: "what_percent", label: "What % is X of Y?" },
];

export default function PercentageCalc() {
  const [mode, setMode] = useState<Mode>("discount");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [copied, setCopied] = useState(false);

  const av = parseFloat(a) || 0;
  const bv = parseFloat(b) || 0;

  let result = { main: "", sub: "" };
  if (mode === "discount") {
    const savings = (av * bv) / 100;
    const final = av - savings;
    result = { main: `Final Price: ₹${final.toFixed(2)}`, sub: `You save: ₹${savings.toFixed(2)} (${bv}% off)` };
  } else if (mode === "markup") {
    const added = (av * bv) / 100;
    const final = av + added;
    result = { main: `Selling Price: ₹${final.toFixed(2)}`, sub: `Markup amount: ₹${added.toFixed(2)} (+${bv}%)` };
  } else if (mode === "percent_of") {
    const val = (bv / 100) * av;
    result = { main: `${bv}% of ${av} = ${val.toFixed(2)}`, sub: `Remaining: ${(av - val).toFixed(2)}` };
  } else {
    const pct = av > 0 ? (bv / av) * 100 : 0;
    result = { main: `${bv} is ${pct.toFixed(2)}% of ${av}`, sub: `Difference: ${(av - bv).toFixed(2)}` };
  }

  const copy = () => {
    navigator.clipboard.writeText(`${result.main}\n${result.sub}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const labelA = mode === "discount" ? "Original Price (₹)" : mode === "markup" ? "Cost Price (₹)" : mode === "percent_of" ? "Total Value" : "Total (Y)";
  const labelB = mode === "discount" ? "Discount (%)" : mode === "markup" ? "Markup (%)" : mode === "percent_of" ? "Percentage (%)" : "Part (X)";
  const placeholderA = mode === "discount" ? "1000" : mode === "markup" ? "500" : mode === "percent_of" ? "500" : "800";
  const placeholderB = mode === "discount" ? "20" : mode === "markup" ? "30" : mode === "percent_of" ? "18" : "200";

  return (
    <ToolLayout
      toolId="pct-calc"
      instructions={
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Discount:</strong> Find final price after a % discount.</li>
          <li><strong>Markup:</strong> Calculate selling price with profit margin.</li>
          <li><strong>X% of Number:</strong> Find a percentage of any value.</li>
          <li><strong>What % is X of Y:</strong> Reverse-calculate the percentage.</li>
        </ul>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {MODES.map((m) => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-colors text-center
                ${mode === m.id ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:bg-muted/70"}`}>
              {m.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{labelA}</Label>
            <Input type="number" min="0" placeholder={placeholderA} value={a} onChange={(e) => setA(e.target.value)} className="h-12 text-lg" />
          </div>
          <div className="space-y-2">
            <Label>{labelB}</Label>
            <Input type="number" min="0" placeholder={placeholderB} value={b} onChange={(e) => setB(e.target.value)} className="h-12 text-lg" />
          </div>
        </div>

        {av > 0 && bv >= 0 && (
          <div className="bg-primary/10 rounded-2xl p-5 border space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xl font-bold">{result.main}</p>
                <p className="text-sm text-muted-foreground mt-1">{result.sub}</p>
              </div>
              <Button size="sm" variant="outline" onClick={copy} className="gap-1 shrink-0">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
