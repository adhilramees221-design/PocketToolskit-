import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { differenceInYears, differenceInMonths, differenceInDays, format, addYears, addMonths } from "date-fns";

export default function AgeCalculator() {
  const [dob, setDob] = useState<string>("");
  const [compareDate, setCompareDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  const age = useMemo(() => {
    if (!dob) return null;
    
    const birthDate = new Date(dob);
    const targetDate = new Date(compareDate);
    
    if (isNaN(birthDate.getTime()) || isNaN(targetDate.getTime()) || birthDate > targetDate) {
      return null;
    }

    const years = differenceInYears(targetDate, birthDate);
    const dateAfterYears = addYears(birthDate, years);
    const months = differenceInMonths(targetDate, dateAfterYears);
    const dateAfterMonths = addMonths(dateAfterYears, months);
    const days = differenceInDays(targetDate, dateAfterMonths);
    
    // Additional fun stats
    const totalMonths = differenceInMonths(targetDate, birthDate);
    const totalDays = differenceInDays(targetDate, birthDate);
    
    return { years, months, days, totalMonths, totalDays };
  }, [dob, compareDate]);

  return (
    <ToolLayout toolId="age-calc" 
      instructions={
        <ul className="list-disc pl-5">
          <li>Select your Date of Birth.</li>
          <li>The calculator defaults to today's date, but you can change it to find out your age on a specific date in the future or past.</li>
          <li>View your exact age down to the days, plus total elapsed months and days.</li>
        </ul>
      }
    >
      <div className="max-w-3xl mx-auto">
        <div className="grid sm:grid-cols-2 gap-8 mb-10">
          <div className="space-y-3">
            <Label htmlFor="dob" className="text-base">Date of Birth</Label>
            <Input 
              id="dob"
              type="date" 
              value={dob}
              max={compareDate}
              onChange={(e) => setDob(e.target.value)}
              className="h-14 text-lg bg-muted/50"
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="compare" className="text-base">Age at the Date of</Label>
            <Input 
              id="compare"
              type="date" 
              value={compareDate}
              onChange={(e) => setCompareDate(e.target.value)}
              className="h-14 text-lg bg-muted/50"
            />
          </div>
        </div>

        {age ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-primary text-primary-foreground rounded-2xl p-8 shadow-lg text-center flex flex-col items-center justify-center min-h-[200px]">
              <h3 className="text-lg font-medium opacity-90 mb-4">Exact Age</h3>
              <div className="flex flex-wrap justify-center items-end gap-2 md:gap-4 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-5xl md:text-7xl font-bold">{age.years}</span>
                  <span className="text-sm uppercase tracking-widest mt-2 opacity-80">Years</span>
                </div>
                <span className="text-3xl md:text-5xl font-light opacity-50 pb-6">-</span>
                <div className="flex flex-col items-center">
                  <span className="text-5xl md:text-7xl font-bold">{age.months}</span>
                  <span className="text-sm uppercase tracking-widest mt-2 opacity-80">Months</span>
                </div>
                <span className="text-3xl md:text-5xl font-light opacity-50 pb-6">-</span>
                <div className="flex flex-col items-center">
                  <span className="text-5xl md:text-7xl font-bold">{age.days}</span>
                  <span className="text-sm uppercase tracking-widest mt-2 opacity-80">Days</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-xl p-6 bg-card text-center shadow-sm">
                <div className="text-sm text-muted-foreground font-medium mb-1">Total Months</div>
                <div className="text-3xl font-bold text-foreground">{age.totalMonths.toLocaleString()}</div>
              </div>
              <div className="border rounded-xl p-6 bg-card text-center shadow-sm">
                <div className="text-sm text-muted-foreground font-medium mb-1">Total Days</div>
                <div className="text-3xl font-bold text-foreground">{age.totalDays.toLocaleString()}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed rounded-2xl p-12 text-center text-muted-foreground bg-muted/20">
            Please select your Date of Birth to calculate your age.
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
