import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function EmiCalculator() {
  const [principal, setPrincipal] = useState<number>(100000);
  const [rate, setRate] = useState<number>(10.5);
  const [years, setYears] = useState<number>(5);

  const calculateEMI = () => {
    const p = principal;
    const r = rate / 12 / 100;
    const n = years * 12;
    
    if (r === 0) return p / n;
    
    const emi = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    return emi;
  };

  const emi = calculateEMI();
  const totalPayment = emi * years * 12;
  const totalInterest = totalPayment - principal;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <ToolLayout toolId="fin-calc" 
      instructions={
        <ul className="list-disc pl-5">
          <li>Enter the loan principal amount.</li>
          <li>Enter the annual interest rate percentage.</li>
          <li>Enter the loan tenure in years.</li>
          <li>The calculator will instantly show your monthly EMI, total interest, and total amount payable.</li>
        </ul>
      }
    >
      <div className="grid lg:grid-cols-[1fr,350px] gap-10">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label className="text-base font-medium">Loan Amount (Principal)</Label>
              <span className="font-bold text-primary">{formatCurrency(principal)}</span>
            </div>
            <Slider 
              value={[principal]} 
              onValueChange={(val) => setPrincipal(val[0])} 
              max={10000000} 
              min={10000} 
              step={10000} 
            />
            <Input 
              type="number" 
              value={principal} 
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="mt-2"
            />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between">
              <Label className="text-base font-medium">Interest Rate (Annual %)</Label>
              <span className="font-bold text-primary">{rate}%</span>
            </div>
            <Slider 
              value={[rate]} 
              onValueChange={(val) => setRate(val[0])} 
              max={25} 
              min={1} 
              step={0.1} 
            />
            <Input 
              type="number" 
              value={rate} 
              onChange={(e) => setRate(Number(e.target.value))}
              className="mt-2"
              step="0.1"
            />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between">
              <Label className="text-base font-medium">Loan Tenure (Years)</Label>
              <span className="font-bold text-primary">{years} Yr ({years * 12} Mo)</span>
            </div>
            <Slider 
              value={[years]} 
              onValueChange={(val) => setYears(val[0])} 
              max={30} 
              min={1} 
              step={1} 
            />
            <Input 
              type="number" 
              value={years} 
              onChange={(e) => setYears(Number(e.target.value))}
              className="mt-2"
            />
          </div>
        </div>

        <div className="bg-primary text-primary-foreground rounded-2xl p-6 shadow-xl flex flex-col">
          <h3 className="text-xl font-medium opacity-90 mb-6">Loan Summary</h3>
          
          <div className="space-y-8 flex-1">
            <div>
              <p className="text-sm opacity-80 mb-1">Monthly EMI</p>
              <div className="text-4xl font-bold">
                {formatCurrency(emi)}
              </div>
            </div>
            
            <div className="space-y-4 pt-6 border-t border-primary-foreground/20">
              <div className="flex justify-between items-center">
                <span className="opacity-80">Principal Amount</span>
                <span className="font-medium">{formatCurrency(principal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-80">Total Interest</span>
                <span className="font-medium">{formatCurrency(totalInterest)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-primary-foreground/20 font-bold">
                <span>Total Payment</span>
                <span>{formatCurrency(totalPayment)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-primary-foreground/20 text-center">
            <div className="w-full flex h-4 rounded-full overflow-hidden mb-2 bg-primary-foreground/20">
              <div 
                className="bg-white h-full" 
                style={{ width: `${(principal / totalPayment) * 100}%` }}
              />
              <div 
                className="bg-accent h-full" 
                style={{ width: `${(totalInterest / totalPayment) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white block"></span> Principal</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent block"></span> Interest</span>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
