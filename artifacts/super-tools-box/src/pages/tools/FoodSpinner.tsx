import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Plus, X, Share2 } from "lucide-react";

const DEFAULT_FOODS = [
  "Chicken Biryani 🍲",
  "Porotta & Beef Curry 🥩",
  "Masala Dosa 🥞",
  "Pizza / Burger 🍕",
  "Noodles 🍜",
  "Chapathi & Chicken Curry 🫓",
  "Fried Rice 🍚",
  "Shawarma 🌯",
  "Puttu & Kadala Curry 🍛",
  "Noodles Soup 🍜",
];

export default function FoodSpinner() {
  const [foods, setFoods] = useState<string[]>(DEFAULT_FOODS);
  const [newFood, setNewFood] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [copied, setCopied] = useState(false);

  const spin = () => {
    if (foods.length === 0) return;
    setSpinning(true);
    setResult(null);
    let count = 0;
    const interval = setInterval(() => {
      setResult(foods[Math.floor(Math.random() * foods.length)]);
      count++;
      if (count > 15) {
        clearInterval(interval);
        setSpinning(false);
      }
    }, 100);
  };

  const addFood = () => {
    const f = newFood.trim();
    if (f && !foods.includes(f)) {
      setFoods([...foods, f]);
      setNewFood("");
    }
  };

  const removeFood = (idx: number) => setFoods(foods.filter((_, i) => i !== idx));

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Today's food choice: ${result}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWA = () => {
    if (!result) return;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Today's food choice 🍴: ${result}\n\nDecided using Pocket Tools Kit 👉 pockettoolskit.com`)}`, "_blank");
  };

  return (
    <ToolLayout
      toolId="food-spin"
      instructions={
        <ul className="list-disc pl-5 space-y-1">
          <li>Add your own favourite dishes to the list.</li>
          <li>Hit "SPIN" to randomly pick today's meal.</li>
          <li>Share the result on WhatsApp with friends.</li>
        </ul>
      }
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-medium">Food Options ({foods.length})</p>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded-xl bg-muted/30">
            {foods.map((food, i) => (
              <div key={i} className="flex items-center gap-1 bg-card border rounded-full px-3 py-1 text-sm">
                <span>{food}</span>
                <button onClick={() => removeFood(i)} className="text-muted-foreground hover:text-destructive ml-1">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Add your own dish... e.g. Appam & Stew 🥘" value={newFood}
              onChange={(e) => setNewFood(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addFood()} />
            <Button variant="outline" onClick={addFood} className="gap-1">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </div>

        <div className="text-center space-y-4">
          <Button size="lg" onClick={spin} disabled={spinning || foods.length === 0}
            className="rounded-full px-10 h-14 text-base gap-2 shadow-lg">
            {spinning ? "🎡 Spinning..." : "🎡 SPIN THE WHEEL!"}
          </Button>

          {result && !spinning && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 space-y-3">
              <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">Today's Food Choice:</p>
              <p className="text-3xl font-bold">{result}</p>
              <div className="flex gap-2 justify-center">
                <Button size="sm" variant="outline" onClick={copy} className="gap-1">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700" onClick={shareWA}>
                  <Share2 className="h-4 w-4" /> Share on WhatsApp
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
