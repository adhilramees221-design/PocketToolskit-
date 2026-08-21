import { useRef, useState } from "react";
import { Check, Download, Flag, Heart, Sparkles, TriangleAlert } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FlagKind = "green" | "red";

type Trait = {
  id: string;
  label: string;
  kind: FlagKind;
};

type ResultStatus = "green" | "red" | "yellow";

type FlagResult = {
  personName: string;
  greenCount: number;
  redCount: number;
  greenPercentage: number;
  redPercentage: number;
  status: ResultStatus;
  verdict: string;
  advice: string;
};

declare global {
  interface Window {
    html2canvas?: (
      element: HTMLElement,
      options?: { backgroundColor?: string; scale?: number; useCORS?: boolean },
    ) => Promise<HTMLCanvasElement>;
  }
}

const TRAITS: Trait[] = [
  { id: "respects-boundaries", label: "Respects boundaries", kind: "green" },
  { id: "good-listener", label: "Actually listens", kind: "green" },
  { id: "keeps-promises", label: "Keeps promises", kind: "green" },
  { id: "honest", label: "Honest & transparent", kind: "green" },
  { id: "supports-goals", label: "Supports your goals", kind: "green" },
  { id: "kind-to-others", label: "Kind to others", kind: "green" },
  { id: "apologizes", label: "Apologizes when wrong", kind: "green" },
  { id: "communicates", label: "Communicates clearly", kind: "green" },
  { id: "gives-space", label: "Gives healthy space", kind: "green" },
  { id: "emotionally-mature", label: "Emotionally mature", kind: "green" },
  { id: "always-late", label: "Always late", kind: "red" },
  { id: "breaks-promises", label: "Breaks promises", kind: "red" },
  { id: "avoids-talks", label: "Avoids serious talks", kind: "red" },
  { id: "secretive", label: "Too secretive", kind: "red" },
  { id: "controlling", label: "Jealous or controlling", kind: "red" },
  { id: "doesnt-listen", label: "Doesn't listen", kind: "red" },
  { id: "badly-exes", label: "Talks badly about exes", kind: "red" },
  { id: "disrespects", label: "Disrespects people", kind: "red" },
  { id: "gaslights", label: "Gaslights or twists facts", kind: "red" },
  { id: "never-apologizes", label: "Never apologizes", kind: "red" },
];

const HTML2CANVAS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
const HTML2CANVAS_INTEGRITY =
  "sha384-ZZ1pncU3bQe8y31yfZdMFdSpttDoPmOZg2wguVK9almUodir1PghgT0eY7Mrty8H";
let html2CanvasPromise: Promise<NonNullable<Window["html2canvas"]>> | null = null;

function loadHtml2Canvas(): Promise<NonNullable<Window["html2canvas"]>> {
  if (window.html2canvas) return Promise.resolve(window.html2canvas);
  if (html2CanvasPromise) return html2CanvasPromise;

  html2CanvasPromise = new Promise((resolve, reject) => {
    document.querySelector<HTMLScriptElement>('script[data-html2canvas="true"]')?.remove();
    const script = document.createElement("script");
    script.src = HTML2CANVAS_URL;
    script.async = true;
    script.integrity = HTML2CANVAS_INTEGRITY;
    script.crossOrigin = "anonymous";
    script.dataset.html2canvas = "true";
    script.onload = () => window.html2canvas
      ? resolve(window.html2canvas)
      : reject(new Error("Image library did not load."));
    script.onerror = () => reject(new Error("Unable to load image library. Please check your connection and try again."));
    document.head.appendChild(script);
  });

  return html2CanvasPromise.catch((error) => {
    document.querySelector<HTMLScriptElement>('script[data-html2canvas="true"]')?.remove();
    html2CanvasPromise = null;
    throw error;
  });
}

function createResult(name: string, selectedTraits: Trait[]): FlagResult {
  const greenCount = selectedTraits.filter((trait) => trait.kind === "green").length;
  const redCount = selectedTraits.length - greenCount;
  const greenPercentage = Math.round((greenCount / selectedTraits.length) * 100);
  const redPercentage = 100 - greenPercentage;

  if (greenCount > redCount) {
    return {
      personName: name.trim() || "This person",
      greenCount,
      redCount,
      greenPercentage,
      redPercentage,
      status: "green",
      verdict: "GREEN FLAG 🟢",
      advice: "The green lights are doing a little victory dance. Enjoy the connection, keep communicating, and let the good habits stay consistent.",
    };
  }
  if (redCount > greenCount) {
    return {
      personName: name.trim() || "This person",
      greenCount,
      redCount,
      greenPercentage,
      redPercentage,
      status: "red",
      verdict: "RED FLAG 🔴",
      advice: "The warning lights are brighter than a group-chat screenshot. Slow down, protect your peace, and make actions—not promises—the real test.",
    };
  }
  return {
    personName: name.trim() || "This person",
    greenCount,
    redCount,
    greenPercentage,
    redPercentage,
    status: "yellow",
    verdict: "YELLOW FLAG 🟡",
    advice: "A mixed signal, not a final verdict. Proceed with curiosity, clear boundaries, and one eye on whether the good habits become consistent.",
  };
}

const RESULT_STYLES: Record<ResultStatus, { color: string; soft: string; border: string; icon: string }> = {
  green: { color: "#34d399", soft: "rgba(52,211,153,.14)", border: "rgba(52,211,153,.45)", icon: "🟢" },
  red: { color: "#fb7185", soft: "rgba(251,113,133,.14)", border: "rgba(251,113,133,.45)", icon: "🔴" },
  yellow: { color: "#fbbf24", soft: "rgba(251,191,36,.14)", border: "rgba(251,191,36,.45)", icon: "🟡" },
};

export default function FlagScore() {
  const [personName, setPersonName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState<FlagResult | null>(null);
  const [selectionError, setSelectionError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  const selectedTraits = TRAITS.filter((trait) => selectedIds.includes(trait.id));
  const selectedGreen = selectedTraits.filter((trait) => trait.kind === "green").length;
  const selectedRed = selectedTraits.length - selectedGreen;

  const toggleTrait = (id: string) => {
    setSelectedIds((current) => current.includes(id)
      ? current.filter((selectedId) => selectedId !== id)
      : [...current, id],
    );
    setSelectionError("");
  };

  const checkStatus = () => {
    if (selectedTraits.length === 0) {
      setSelectionError("Select at least one trait to check the flag status.");
      return;
    }
    setSelectionError("");
    setDownloadError("");
    setResult(createResult(personName, selectedTraits));
  };

  const downloadCard = async () => {
    if (!cardRef.current || !result || downloading) return;
    setDownloading(true);
    setDownloadError("");
    try {
      const html2canvas = await loadHtml2Canvas();
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#101827",
        scale: Math.min(3, window.devicePixelRatio || 2),
        useCORS: true,
      });
      const link = document.createElement("a");
      const safeName = result.personName.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "Person";
      link.download = `Flag_Result_${safeName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "Could not create the flag card. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ToolLayout
      toolId="flag-score"
      instructions={
        <ul className="list-disc space-y-1 pl-5">
          <li>Enter a name (optional), then select the habits that fit the person.</li>
          <li>Five to eight traits gives the most balanced, fun result.</li>
          <li>This flag check is just for entertainment—not a real personality assessment.</li>
        </ul>
      }
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-2">
          <Label htmlFor="flag-person-name">Enter Person&apos;s Name</Label>
          <Input
            id="flag-person-name"
            value={personName}
            onChange={(event) => setPersonName(event.target.value)}
            maxLength={60}
            autoComplete="off"
          />
        </div>

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="font-semibold">Select their behaviors / habits</h3>
              <p className="mt-1 text-sm text-muted-foreground">Pick multiple traits—5 to 8 is a good sweet spot.</p>
            </div>
            <div className="rounded-full bg-muted px-3 py-1 text-sm font-bold">
              {selectedIds.length} selected
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <TraitGroup
              title="Green Flag traits"
              subtitle="10 positive habits"
              traits={TRAITS.filter((trait) => trait.kind === "green")}
              selectedIds={selectedIds}
              onToggle={toggleTrait}
              kind="green"
            />
            <TraitGroup
              title="Red Flag traits"
              subtitle="10 warning signs"
              traits={TRAITS.filter((trait) => trait.kind === "red")}
              selectedIds={selectedIds}
              onToggle={toggleTrait}
              kind="red"
            />
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 rounded-2xl border bg-muted/20 p-4 text-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Green selected</p>
            <p className="mt-1 text-2xl font-black text-emerald-500">{selectedGreen}</p>
          </div>
          <div className="border-l">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Red selected</p>
            <p className="mt-1 text-2xl font-black text-rose-500">{selectedRed}</p>
          </div>
        </div>

        <Button onClick={checkStatus} className="h-13 w-full gap-2 text-base font-extrabold">
          <Flag className="h-5 w-5" /> CHECK FLAG STATUS
        </Button>
        {selectionError && <p className="text-center text-sm font-medium text-destructive">{selectionError}</p>}
      </div>

      <Dialog open={Boolean(result)} onOpenChange={(open) => !open && setResult(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md border-0 bg-transparent p-0 shadow-none sm:rounded-none">
          <DialogTitle className="sr-only">Flag analysis result</DialogTitle>
          <DialogDescription className="sr-only">
            The selected person&apos;s green and red flag percentage and advice.
          </DialogDescription>
          {result && (
            <div className="space-y-4">
              <FlagResultCard ref={cardRef} result={result} />
              <Button onClick={downloadCard} disabled={downloading} className="h-12 w-full rounded-xl bg-sky-400 font-bold text-slate-950 hover:bg-sky-300">
                <Download className="h-4 w-4" /> {downloading ? "Creating Image…" : "Download Flag Card"}
              </Button>
              {downloadError && <p className="text-center text-sm text-red-200">{downloadError}</p>}
              <Button variant="ghost" onClick={() => setResult(null)} className="h-10 w-full text-slate-200 hover:bg-white/10 hover:text-white">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ToolLayout>
  );
}

function TraitGroup({
  title,
  subtitle,
  traits,
  selectedIds,
  onToggle,
  kind,
}: {
  title: string;
  subtitle: string;
  traits: Trait[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  kind: FlagKind;
}) {
  const palette = kind === "green"
    ? { title: "text-emerald-600 dark:text-emerald-400", selected: "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/25", marker: "accent-emerald-500" }
    : { title: "text-rose-600 dark:text-rose-400", selected: "border-rose-400 bg-rose-50 dark:bg-rose-950/25", marker: "accent-rose-500" };

  return (
    <section className="rounded-2xl border p-3">
      <div className="mb-3 px-1">
        <h4 className={cn("font-bold", palette.title)}>{title}</h4>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="space-y-2">
        {traits.map((trait) => {
          const isSelected = selectedIds.includes(trait.id);
          return (
            <label key={trait.id} className={cn(
              "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
              isSelected ? palette.selected : "bg-background hover:bg-muted/50",
            )}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(trait.id)}
                className={cn("h-4 w-4 shrink-0", palette.marker)}
              />
              <span>{trait.label}</span>
              {isSelected && <Check className={cn("ml-auto h-4 w-4", palette.title)} />}
            </label>
          );
        })}
      </div>
    </section>
  );
}

function FlagResultCard({ result, ref }: { result: FlagResult; ref: React.RefObject<HTMLDivElement | null> }) {
  const style = RESULT_STYLES[result.status];
  const StatusIcon = result.status === "green" ? Heart : result.status === "red" ? TriangleAlert : Sparkles;

  // The capture target uses only inline hex/RGBA colors because html2canvas
  // does not support Tailwind's modern oklch() color values.
  return (
    <div
      ref={ref}
      style={{
        overflow: "hidden",
        borderRadius: "28px",
        border: `1px solid ${style.border}`,
        backgroundColor: "#101827",
        padding: "28px",
        textAlign: "center",
        color: "#ffffff",
        fontFamily: "'Plus Jakarta Sans', Arial, sans-serif",
      }}
    >
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: "56px", height: "56px", margin: "0 auto 16px", borderRadius: "16px",
        backgroundColor: style.soft, color: style.color,
      }}>
        <StatusIcon style={{ width: "28px", height: "28px" }} />
      </div>
      <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px", fontWeight: 800, letterSpacing: ".18em" }}>FLAG ANALYSIS RESULT</p>
      <h2 style={{ margin: "10px 0 16px", fontSize: "26px", fontWeight: 900 }}>{result.personName}</h2>
      <div style={{
        display: "inline-block", borderRadius: "999px", border: `1px solid ${style.border}`,
        backgroundColor: style.soft, color: style.color, padding: "9px 16px", fontSize: "16px", fontWeight: 900,
      }}>
        {result.verdict}
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden",
        margin: "24px 0 16px", borderRadius: "16px", border: "1px solid rgba(255,255,255,.1)",
      }}>
        <div style={{ padding: "18px", borderRight: "1px solid rgba(255,255,255,.1)", backgroundColor: "rgba(52,211,153,.08)" }}>
          <p style={{ margin: 0, color: "#a7f3d0", fontSize: "11px", fontWeight: 800, letterSpacing: ".1em" }}>GREEN FLAGS</p>
          <p style={{ margin: "5px 0 0", color: "#34d399", fontSize: "34px", fontWeight: 900 }}>{result.greenPercentage}%</p>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "11px" }}>{result.greenCount} traits</p>
        </div>
        <div style={{ padding: "18px", backgroundColor: "rgba(251,113,133,.08)" }}>
          <p style={{ margin: 0, color: "#fecdd3", fontSize: "11px", fontWeight: 800, letterSpacing: ".1em" }}>RED FLAGS</p>
          <p style={{ margin: "5px 0 0", color: "#fb7185", fontSize: "34px", fontWeight: 900 }}>{result.redPercentage}%</p>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "11px" }}>{result.redCount} traits</p>
        </div>
      </div>
      <div style={{ borderRadius: "14px", backgroundColor: "rgba(255,255,255,.06)", padding: "16px", textAlign: "left" }}>
        <p style={{ margin: "0 0 6px", color: style.color, fontSize: "12px", fontWeight: 800, letterSpacing: ".08em" }}>THE VERDICT</p>
        <p style={{ margin: 0, color: "#dbeafe", fontSize: "14px", lineHeight: 1.55 }}>{result.advice}</p>
      </div>
      <p style={{ margin: "20px 0 0", color: "#64748b", fontSize: "11px" }}>For entertainment only · Pocket Tools Kit</p>
    </div>
  );
}