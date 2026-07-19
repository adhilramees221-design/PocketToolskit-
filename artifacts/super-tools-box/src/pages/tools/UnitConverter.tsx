import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft } from "lucide-react";

type UnitType = "Length" | "Weight" | "Temperature" | "Area";

const conversions = {
  Length: {
    meters: 1,
    kilometers: 0.001,
    centimeters: 100,
    millimeters: 1000,
    inches: 39.3701,
    feet: 3.28084,
    yards: 1.09361,
    miles: 0.000621371,
  },
  Weight: {
    kilograms: 1,
    grams: 1000,
    milligrams: 1000000,
    pounds: 2.20462,
    ounces: 35.274,
  },
  Area: {
    square_meters: 1,
    hectares: 0.0001,
    acres: 0.000247105,
    square_feet: 10.7639,
  }
};

export default function UnitConverter() {
  const [unitType, setUnitType] = useState<UnitType>("Length");
  const [fromUnit, setFromUnit] = useState("meters");
  const [toUnit, setToUnit] = useState("feet");
  const [inputValue, setInputValue] = useState("1");

  const handleTypeChange = (value: UnitType) => {
    setUnitType(value);
    if (value === "Temperature") {
      setFromUnit("celsius");
      setToUnit("fahrenheit");
    } else {
      const units = Object.keys(conversions[value]);
      setFromUnit(units[0]);
      setToUnit(units[1]);
    }
  };

  const calculateResult = () => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return "";

    if (unitType === "Temperature") {
      if (fromUnit === "celsius" && toUnit === "fahrenheit") return ((val * 9/5) + 32).toFixed(4);
      if (fromUnit === "fahrenheit" && toUnit === "celsius") return ((val - 32) * 5/9).toFixed(4);
      if (fromUnit === "celsius" && toUnit === "kelvin") return (val + 273.15).toFixed(4);
      if (fromUnit === "kelvin" && toUnit === "celsius") return (val - 273.15).toFixed(4);
      if (fromUnit === "fahrenheit" && toUnit === "kelvin") return ((val - 32) * 5/9 + 273.15).toFixed(4);
      if (fromUnit === "kelvin" && toUnit === "fahrenheit") return ((val - 273.15) * 9/5 + 32).toFixed(4);
      return val.toString();
    }

    const rates = conversions[unitType as keyof typeof conversions];
    // @ts-ignore
    const baseValue = val / rates[fromUnit];
    // @ts-ignore
    const result = baseValue * rates[toUnit];
    
    // Format to avoid long decimals but keep precision
    return parseFloat(result.toFixed(6)).toString();
  };

  const getUnitOptions = () => {
    if (unitType === "Temperature") {
      return ["celsius", "fahrenheit", "kelvin"];
    }
    return Object.keys(conversions[unitType as keyof typeof conversions]);
  };

  const formatLabel = (str: string) => {
    return str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <ToolLayout toolId="unit-conv" 
      instructions={
        <ul className="list-disc pl-5">
          <li>Select the category of measurement (Length, Weight, Temperature, etc).</li>
          <li>Choose the units you want to convert from and to.</li>
          <li>Enter the value to convert. The result updates automatically.</li>
        </ul>
      }
    >
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={unitType} onValueChange={(v) => handleTypeChange(v as UnitType)}>
            <SelectTrigger className="h-12 text-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Length">Length</SelectItem>
              <SelectItem value="Weight">Weight</SelectItem>
              <SelectItem value="Temperature">Temperature</SelectItem>
              <SelectItem value="Area">Area</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>From</Label>
              <Select value={fromUnit} onValueChange={setFromUnit}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getUnitOptions().map(u => (
                    <SelectItem key={u} value={u}>{formatLabel(u)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input 
              type="number" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)}
              className="h-16 text-2xl font-semibold text-center border-primary shadow-sm focus-visible:ring-primary/50"
            />
          </div>
          
          <div className="flex justify-center items-center h-full pt-8">
            <div className="bg-muted p-3 rounded-full text-muted-foreground border">
              <ArrowRightLeft className="h-6 w-6" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>To</Label>
              <Select value={toUnit} onValueChange={setToUnit}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getUnitOptions().map(u => (
                    <SelectItem key={u} value={u}>{formatLabel(u)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="h-16 flex items-center justify-center rounded-md border bg-muted px-3 text-2xl font-bold text-primary truncate shadow-inner">
              {calculateResult()}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
