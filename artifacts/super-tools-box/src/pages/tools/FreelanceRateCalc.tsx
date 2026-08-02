import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";

export default function FreelanceRateCalc() {
  const [income, setIncome] = useState("");
  const [hours, setHours] = useState("");
  const [expenses, setExpenses] = useState("");
  const [taxPct, setTaxPct] = useState("10");
  const [copied, setCopied] = useState(false);

  const inc = parseFloat(income) || 0;
  const hrs = parseFloat(hours) || 1;
  const exp = parseFloat(expenses) || 0;
  const tax = parseFloat(taxPct) || 0;

  const monthlyNeed = inc + exp;
  const withTax = monthlyNeed / (1 - tax / 100);
  const billableHrsMonth = hrs * 4.33;
  const hourlyRate = Math.ceil(withTax / billableHrsMonth);
  const dayRate = Math.ceil(hourlyRate * 8);
  const weekRate = Math.ceil(hourlyRate * hrs);
  const projectQuote = (days: number) => Math.ceil(dayRate * days);

  const hasResult = inc > 0 && hrs > 0;

  const resultText = hasResult
    ? `Freelance Rate Summary:\n• Hourly Rate: ₹${hourlyRate}/hr\n• Daily Rate (8hrs): ₹${dayRate}/day\n• Weekly Rate (${hrs}hrs/wk): ₹${weekRate}/week\n• Monthly Billable Hours: ${Math.round(billableHrsMonth)}hrs\n\nProject Quotes:\n• 1-day project: ₹${projectQuote(1)}\n• 1-week project: ₹${projectQuote(5)}\n• 1-month project: ₹${projectQuote(22)}`
    : "";

  const copy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      toolId="fl-rate"
      instructions={
        <ul className="list-disc pl-5 space-y-1">
          <li>Enter your desired take-home income, billable hours per week, and monthly expenses.</li>
          <li>Tax % ensures your rate covers self-employment taxes.</li>
          <li>The calculator accounts for non-billable time (meetings, revisions, admin).</li>
          <li>Copy the full rate card and paste it into client proposals.</li>
        </ul>
      }
    >
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="income">Desired Monthly Income (₹)</Label>
            <Input id="income" type="number" min="0" placeholder="e.g. 50000" value={income} onChange={(e) => setIncome(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hours">Billable Hours per Week</Label>
            <Input id="hours" type="number" min="1" max="60" placeholder="e.g. 30" value={hours} onChange={(e) => setHours(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expenses">Monthly Business Expenses (₹)</Label>
            <Input id="expenses" type="number" min="0" placeholder="e.g. 5000" value={expenses} onChange={(e) => setExpenses(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax">Tax / Savings Buffer (%)</Label>
            <Input id="tax" type="number" min="0" max="50" placeholder="e.g. 10" value={taxPct} onChange={(e) => setTaxPct(e.target.value)} />
          </div>
        </div>

        <div className="space-y-4">
          {hasResult ? (
            <>
              <div className="bg-primary/10 rounded-2xl p-5 border space-y-3">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Recommended Hourly Rate</p>
                  <p className="text-4xl font-bold text-primary">₹{hourlyRate}<span className="text-lg font-normal text-muted-foreground">/hr</span></p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {[
                    { label: "Daily Rate (8hrs)", val: `₹${dayRate}` },
                    { label: `Weekly (${hrs}hrs)`, val: `₹${weekRate}` },
                    { label: "1-Week Project", val: `₹${projectQuote(5)}` },
                    { label: "1-Month Project", val: `₹${projectQuote(22)}` },
                  ].map((r) => (
                    <div key={r.label} className="bg-card border rounded-xl p-3 text-center">
                      <p className="text-xs text-muted-foreground">{r.label}</p>
                      <p className="font-bold text-base">{r.val}</p>
                    </div>
                  ))}
                </div>
              </div>
              <Button variant="outline" className="w-full gap-2" onClick={copy}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy Full Rate Card"}
              </Button>
            </>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-2xl p-8 text-center">
              <p className="text-muted-foreground text-sm">Fill in your income and hours to see your recommended rate</p>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
