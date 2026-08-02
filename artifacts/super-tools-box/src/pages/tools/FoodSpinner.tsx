import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SpinWheel } from "@/components/SpinWheel";
import { Copy, Check, Plus, X, Share2 } from "lucide-react";

const DEFAULT_FOODS = [
  "Biryani 🍲",
  "Porotta & Beef 🥩",
  "Masala Dosa 🥞",
  "Pizza 🍕",
  "Noodles 🍜",
  "Chapathi 🫓",
  "Fried Rice 🍚",
  "Shawarma 🌯",
  "Puttu & Kadala 🍛",
  "Burger 🍔",
];

export default function FoodSpinner() {
  const [foods, setFoods] = useState<string[]>(DEFAULT_FOODS);
  const [newFood, setNewFood] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const spin = () => {
    if (foods.length === 0 || spinning) return;
    const idx = Math.floor(Math.random() * foods.length);
    setResult(null);
    setTargetIndex(idx);
    setSpinning(true);
  };

  const onSpinComplete = () => {
    if (targetIndex !== null) setResult(foods[targetIndex]);
    setSpinning(false);
  };

  const addFood = () => {
    const f = newFood.trim();
    if (f && !foods.includes(f)) {
      setFoods([...foods, f]);
      setNewFood("");
    }
  };

  const removeFood = (idx: number) => {
    setFoods(foods.filter((_, i) => i !== idx));
    setResult(null);
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Today's food choice: ${result}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWA = () => {
    if (!result) return;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `Today's food choice 🍴: ${result}\n\nDecided using Pocket Tools Kit 👉 pockettoolskit.com`
      )}`,
      "_blank"
    );
  };

  return (
    <ToolLayout
      toolId="food-spin"
      instructions={
        <ul className="list-disc pl-5 space-y-1">
          <li>Add or remove dishes from the wheel.</li>
          <li>Hit <strong>SPIN</strong> — the wheel spins and stops randomly!</li>
          <li>Share the result on WhatsApp with your group.</li>
        </ul>
      }
    >
      <div className="space-y-5">
        {/* Wheel */}
        <div className="relative py-2">
          <SpinWheel
            items={foods}
            spinning={spinning}
            targetIndex={targetIndex}
            onSpinComplete={onSpinComplete}
            size={320}
          />
        </div>

        {/* Spin button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={spin}
            disabled={spinning || foods.length < 2}
            className="rounded-full px-10 h-14 text-base gap-2 shadow-lg"
          >
            {spinning ? "🎡 Spinning..." : "🎡 SPIN THE WHEEL!"}
          </Button>
        </div>

        {/* Result */}
        {result && !spinning && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 text-center space-y-3">
            <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">🎉 Today's Food Choice:</p>
            <p className="text-2xl font-bold">{result}</p>
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

        {/* Food list editor */}
        <div className="space-y-3 border-t pt-4">
          <p className="text-sm font-medium">Customize Dishes ({foods.length})</p>
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 border rounded-xl bg-muted/30">
            {foods.map((food, i) => (
              <div key={i} className="flex items-center gap-1 bg-card border rounded-full px-3 py-1 text-sm">
                <span>{food}</span>
                <button
                  onClick={() => removeFood(i)}
                  className="text-muted-foreground hover:text-destructive ml-1"
                  disabled={spinning}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add dish... e.g. Appam & Stew 🥘"
              value={newFood}
              onChange={(e) => setNewFood(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addFood()}
            />
            <Button variant="outline" onClick={addFood} disabled={spinning} className="gap-1">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
