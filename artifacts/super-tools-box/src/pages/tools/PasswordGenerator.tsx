import { useState, useEffect, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState([16]);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generatePassword = useCallback(() => {
    let charset = "";
    if (options.uppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (options.lowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (options.numbers) charset += "0123456789";
    if (options.symbols) charset += "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    if (charset === "") {
      setPassword("");
      return;
    }

    let newPassword = "";
    const array = new Uint32Array(length[0]);
    window.crypto.getRandomValues(array);
    
    for (let i = 0; i < length[0]; i++) {
      newPassword += charset[array[i] % charset.length];
    }
    
    setPassword(newPassword);
    setCopied(false);
  }, [length, options]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const copyToClipboard = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Password copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const calculateStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length > 8) score += 1;
    if (password.length > 12) score += 1;
    if (options.uppercase && options.lowercase) score += 1;
    if (options.numbers) score += 1;
    if (options.symbols) score += 1;
    return score;
  };

  const strength = calculateStrength();
  const strengthColor = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500", "bg-emerald-600"][Math.min(strength, 4)];
  const strengthLabel = ["Weak", "Fair", "Good", "Strong", "Very Strong"][Math.min(strength, 4)];

  return (
    <ToolLayout toolId="pass-gen" 
      instructions={
        <ul className="list-disc pl-5">
          <li>Select the desired length for your password (6-64 characters).</li>
          <li>Toggle character types to include (uppercase, lowercase, numbers, symbols).</li>
          <li>Click the refresh icon to generate a new password with the same settings.</li>
          <li>Click 'Copy' to copy the password securely to your clipboard.</li>
        </ul>
      }
    >
      <div className="space-y-8">
        <div className="relative">
          <div className="bg-muted border p-6 rounded-2xl font-mono text-2xl md:text-3xl text-center break-all shadow-inner tracking-wider select-all min-h-[96px] flex items-center justify-center">
            {password || <span className="text-muted-foreground/50">Select options to generate</span>}
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
            <Button size="icon" variant="secondary" onClick={generatePassword} title="Regenerate">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="icon" onClick={copyToClipboard} variant={copied ? "default" : "secondary"} className={copied ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {password && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-muted-foreground">Password Strength</span>
              <span className={`font-bold ${strength > 2 ? 'text-emerald-500' : 'text-orange-500'}`}>{strengthLabel}</span>
            </div>
            <div className="flex gap-1 h-2">
              {[0, 1, 2, 3, 4].map(level => (
                <div 
                  key={level} 
                  className={`flex-1 rounded-full ${level < strength ? strengthColor : 'bg-muted'}`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6 pt-6 border-t">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-medium">Password Length</Label>
              <span className="text-lg font-bold bg-muted px-3 py-1 rounded-md">{length[0]}</span>
            </div>
            <Slider 
              value={length} 
              onValueChange={setLength} 
              max={64} 
              min={6} 
              step={1}
              className="py-4"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="flex items-center justify-between p-4 rounded-xl border bg-card shadow-sm">
              <Label htmlFor="uppercase" className="text-base cursor-pointer">Uppercase (A-Z)</Label>
              <Switch 
                id="uppercase" 
                checked={options.uppercase} 
                onCheckedChange={(c) => setOptions(o => ({...o, uppercase: c}))} 
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border bg-card shadow-sm">
              <Label htmlFor="lowercase" className="text-base cursor-pointer">Lowercase (a-z)</Label>
              <Switch 
                id="lowercase" 
                checked={options.lowercase} 
                onCheckedChange={(c) => setOptions(o => ({...o, lowercase: c}))} 
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border bg-card shadow-sm">
              <Label htmlFor="numbers" className="text-base cursor-pointer">Numbers (0-9)</Label>
              <Switch 
                id="numbers" 
                checked={options.numbers} 
                onCheckedChange={(c) => setOptions(o => ({...o, numbers: c}))} 
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border bg-card shadow-sm">
              <Label htmlFor="symbols" className="text-base cursor-pointer">Symbols (!@#)</Label>
              <Switch 
                id="symbols" 
                checked={options.symbols} 
                onCheckedChange={(c) => setOptions(o => ({...o, symbols: c}))} 
              />
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
