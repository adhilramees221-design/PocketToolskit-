import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

const GST_RATES = [5, 12, 18, 28];
const DISCOUNT_PRESETS = [0, 5, 10, 15, 20, 25, 30, 50];

export default function GstCalculator() {
  const [amount, setAmount] = useState("1000");
  const [gstRate, setGstRate] = useState(18);
  const [discount, setDiscount] = useState(0);
  const [gstType, setGstType] = useState<"add" | "extract">("add");

  const base = parseFloat(amount) || 0;
  const discountAmt = (base * discount) / 100;
  const afterDiscount = base - discountAmt;

  let netAmount = 0, gstAmount = 0, totalAmount = 0;
  if (gstType === "add") {
    netAmount = afterDiscount;
    gstAmount = (netAmount * gstRate) / 100;
    totalAmount = netAmount + gstAmount;
  } else {
    totalAmount = afterDiscount;
    netAmount = totalAmount / (1 + gstRate / 100);
    gstAmount = totalAmount - netAmount;
  }

  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;

  const fmt = (n: number) => "₹" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const copyAll = () => {
    const text = `Original Amount: ${fmt(base)}\nDiscount (${discount}%): -${fmt(discountAmt)}\nAfter Discount: ${fmt(afterDiscount)}\nGST (${gstRate}%): ${fmt(gstAmount)}\n  CGST (${gstRate/2}%): ${fmt(cgst)}\n  SGST (${gstRate/2}%): ${fmt(sgst)}\nTotal: ${fmt(totalAmount)}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <ToolLayout
      toolId="gst-calc"
      instructions={
        <ul className="list-disc pl-5">
          <li>Enter the base amount, select GST rate and discount.</li>
          <li>"Add GST" calculates total including GST on top of the amount.</li>
          <li>"Extract GST" finds GST hidden inside an already-inclusive price.</li>
        </ul>
      }
    >
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Inputs */}
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input id="amount" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 text-lg" placeholder="1000" />
          </div>

          <div className="space-y-2">
            <Label>GST Rate</Label>
            <div className="grid grid-cols-4 gap-2">
              {GST_RATES.map((r) => (
                <button key={r} onClick={() => setGstRate(r)}
                  className={`py-2 rounded-lg text-sm font-semibold border transition-colors
                    ${gstRate === r ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:bg-muted/70"}`}>
                  {r}%
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Discount</Label>
            <div className="grid grid-cols-4 gap-2">
              {DISCOUNT_PRESETS.map((d) => (
                <button key={d} onClick={() => setDiscount(d)}
                  className={`py-2 rounded-lg text-sm font-semibold border transition-colors
                    ${discount === d ? "bg-secondary text-secondary-foreground border-secondary" : "bg-muted text-muted-foreground border-border hover:bg-muted/70"}`}>
                  {d === 0 ? "None" : `${d}%`}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Calculation Type</Label>
            <div className="flex rounded-xl overflow-hidden border">
              {(["add", "extract"] as const).map((t) => (
                <button key={t} onClick={() => setGstType(t)}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-colors
                    ${gstType === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                  {t === "add" ? "Add GST" : "Extract GST"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="bg-muted rounded-2xl border p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg">Calculation Result</h3>
            <Button size="sm" variant="outline" onClick={copyAll} className="gap-1 text-xs">
              <Copy className="h-3.5 w-3.5" /> Copy
            </Button>
          </div>

          <div className="space-y-2 text-sm">
            {[
              { label: "Original Amount", val: fmt(base), muted: false },
              ...(discount > 0 ? [
                { label: `Discount (${discount}%)`, val: `- ${fmt(discountAmt)}`, muted: true },
                { label: "After Discount", val: fmt(afterDiscount), muted: false },
              ] : []),
              { label: `GST (${gstRate}%)`, val: fmt(gstAmount), muted: false },
              { label: `  CGST (${gstRate / 2}%)`, val: fmt(cgst), muted: true },
              { label: `  SGST (${gstRate / 2}%)`, val: fmt(sgst), muted: true },
            ].map((row, i) => (
              <div key={i} className={`flex justify-between py-1 border-b border-border/50 ${row.muted ? "text-muted-foreground" : ""}`}>
                <span>{row.label}</span>
                <span className={row.muted ? "" : "font-semibold"}>{row.val}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 mt-1 bg-primary/10 rounded-lg px-3">
              <span className="font-bold text-base">Total Amount</span>
              <span className="font-bold text-base text-primary">{fmt(totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
