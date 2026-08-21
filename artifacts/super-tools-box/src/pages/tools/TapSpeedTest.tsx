import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Play, RotateCcw, Timer, Trophy, Zap } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    html2canvas?: (
      element: HTMLElement,
      options?: { backgroundColor?: string; scale?: number; useCORS?: boolean },
    ) => Promise<HTMLCanvasElement>;
  }
}

const HTML2CANVAS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";

let html2CanvasPromise: Promise<NonNullable<Window["html2canvas"]>> | null = null;

function loadHtml2Canvas(): Promise<NonNullable<Window["html2canvas"]>> {
  if (window.html2canvas) return Promise.resolve(window.html2canvas);
  if (html2CanvasPromise) return html2CanvasPromise;

  html2CanvasPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-html2canvas="true"]',
    );
    // A script can remain after a failed or malformed previous load. Remove it
    // instead of waiting for a load event that has already happened.
    if (existing) {
      existing.remove();
    }

    const script = document.createElement("script");
    script.src = HTML2CANVAS_URL;
    script.async = true;
    script.dataset.html2canvas = "true";
    script.onload = () =>
      window.html2canvas
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

function playStartBeep() {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(660, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(990, context.currentTime + 0.1);
    gain.gain.setValueAtTime(0.001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16, context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.17);
    window.setTimeout(() => context.close().catch(() => {}), 250);
  } catch {
    // Audio is an enhancement; the test still works if a browser blocks it.
  }
}

export default function TapSpeedTest() {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState<30 | 60>(30);
  const [testDuration, setTestDuration] = useState<30 | 60>(30);
  const [remaining, setRemaining] = useState(30);
  const [taps, setTaps] = useState(0);
  const [running, setRunning] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultName, setResultName] = useState("Guest");
  const [resultTaps, setResultTaps] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const endTimeRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const tapsRef = useRef(0);
  const scoreCardRef = useRef<HTMLDivElement>(null);

  const finishTest = useCallback(() => {
    if (!endTimeRef.current) return;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
    endTimeRef.current = 0;
    setRunning(false);
    setRemaining(0);
    setResultName(name.trim() || "Guest");
    setResultTaps(tapsRef.current);
    setResultOpen(true);
  }, [name]);

  useEffect(() => {
    if (!running) return;

    const tick = () => {
      const msLeft = Math.max(0, endTimeRef.current - performance.now());
      const secondsLeft = Math.ceil(msLeft / 1000);
      setRemaining(secondsLeft);
      if (msLeft <= 0) {
        finishTest();
        return;
      }
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [finishTest, running]);

  useEffect(
    () => () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    },
    [],
  );

  const startTest = () => {
    if (running) return;
    playStartBeep();
    const selectedDuration = duration;
    setTestDuration(selectedDuration);
    setRemaining(selectedDuration);
    tapsRef.current = 0;
    setTaps(0);
    setResultOpen(false);
    setDownloadError("");
    endTimeRef.current = performance.now() + selectedDuration * 1000;
    setRunning(true);
  };

  const registerTap = (event?: { preventDefault: () => void }) => {
    event?.preventDefault();
    if (!running || performance.now() >= endTimeRef.current) return;
    tapsRef.current += 1;
    setTaps(tapsRef.current);
  };

  const speed = resultTaps / testDuration;

  const downloadScore = async () => {
    if (!scoreCardRef.current || downloading) return;
    setDownloading(true);
    setDownloadError("");

    try {
      const html2canvas = await loadHtml2Canvas();
      const canvas = await html2canvas(scoreCardRef.current, {
        backgroundColor: "#0f172a",
        scale: Math.min(3, window.devicePixelRatio || 2),
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `tap-speed-score-${resultName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "guest"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "Could not create the image. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ToolLayout
      toolId="tap-speed"
      instructions={
        <ul className="list-disc space-y-1 pl-5">
          <li>Enter your name (optional), choose 30 or 60 seconds, then press <strong>START TEST</strong>.</li>
          <li>Tap the blue arena as quickly as you can until the countdown reaches zero.</li>
          <li>Your total taps and average taps per second are ready to download as a score card.</li>
        </ul>
      }
    >
      <div className="mx-auto max-w-xl space-y-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-2">
            <label htmlFor="tap-player-name" className="text-sm font-semibold">
              Enter Your Name <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="tap-player-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={running}
              autoComplete="off"
              maxLength={32}
              aria-label="Enter Your Name"
            />
          </div>
          <div className="flex rounded-xl border bg-muted/40 p-1" role="group" aria-label="Test duration">
            {([30, 60] as const).map((seconds) => (
              <button
                type="button"
                key={seconds}
                disabled={running}
                onClick={() => {
                  setDuration(seconds);
                  setRemaining(seconds);
                }}
                className={cn(
                  "min-h-10 rounded-lg px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                  duration === seconds ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground",
                )}
              >
                {seconds === 60 ? "60 Seconds" : "30 Seconds"}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="button"
          onClick={startTest}
          disabled={running}
          size="lg"
          className="h-14 w-full rounded-xl text-base font-extrabold tracking-wide shadow-lg shadow-primary/20"
        >
          {running ? <Timer className="h-5 w-5 animate-pulse" /> : <Play className="h-5 w-5 fill-current" />}
          {running ? "TEST IN PROGRESS" : "START TEST"}
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Time Left" value={`${remaining}s`} icon={<Timer className="h-4 w-4" />} urgent={running && remaining <= 5} />
          <StatCard label="Live Taps" value={String(taps)} icon={<Zap className="h-4 w-4" />} />
        </div>

        <div
          role="button"
          tabIndex={running ? 0 : -1}
          aria-label={running ? "Tap here to increase your score" : "Start the test to unlock the tap area"}
          onMouseDown={registerTap}
          onTouchStart={registerTap}
          onKeyDown={(event) => {
            if ((event.key === "Enter" || event.key === " ") && running) {
              registerTap(event);
            }
          }}
          className={cn(
            "relative flex min-h-64 select-none flex-col items-center justify-center overflow-hidden rounded-3xl border-4 border-dashed px-6 text-center transition-transform duration-75",
            "touch-none outline-none focus-visible:ring-4 focus-visible:ring-primary/40",
            running
              ? "cursor-pointer border-sky-300 bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/25 active:scale-[0.985]"
              : "cursor-not-allowed border-border bg-muted/50 text-muted-foreground",
          )}
        >
          {running && <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,.2),transparent_55%)]" />}
          <Zap className={cn("relative mb-3 h-12 w-12", running && "fill-amber-300 text-amber-300")} />
          <span className="relative text-4xl font-black tracking-tight sm:text-5xl">
            {running ? "TAP HERE!" : "READY?"}
          </span>
          <span className="relative mt-3 text-sm font-semibold tracking-wide opacity-85">
            {running ? "Every tap counts — go fast!" : "Press START TEST to unlock"}
          </span>
        </div>

        {!running && taps > 0 && !resultOpen && (
          <Button variant="outline" onClick={startTest} className="mx-auto flex gap-2">
            <RotateCcw className="h-4 w-4" /> Test Again
          </Button>
        )}
      </div>

      <Dialog open={resultOpen} onOpenChange={setResultOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md border-0 bg-transparent p-0 shadow-none sm:rounded-none">
          <DialogTitle className="sr-only">Tap speed test result</DialogTitle>
          <DialogDescription className="sr-only">
            Your total tap count and average taps per second.
          </DialogDescription>
          <div className="space-y-4">
            <div
              ref={scoreCardRef}
              // Inline, legacy color values are deliberate: html2canvas 1.4
              // cannot parse Tailwind's modern oklch() color values.
              style={{
                overflow: "hidden",
                borderRadius: "2rem",
                border: "1px solid rgba(56, 189, 248, .4)",
                backgroundColor: "#0f172a",
                padding: "28px",
                textAlign: "center",
                color: "#ffffff",
                fontFamily: "'Plus Jakarta Sans', Arial, sans-serif",
              }}
            >
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "56px", height: "56px", margin: "0 auto 16px",
                borderRadius: "16px", backgroundColor: "rgba(56, 189, 248, .15)", color: "#7dd3fc",
              }}>
                <Trophy style={{ width: "28px", height: "28px" }} />
              </div>
              <p style={{ margin: 0, color: "#7dd3fc", fontSize: "12px", fontWeight: 800, letterSpacing: ".22em" }}>TAP SPEED RESULT</p>
              <h2 style={{ margin: "12px 0 0", fontSize: "24px", fontWeight: 900 }}>Player: {resultName}</h2>
              <div style={{
                margin: "24px 0", borderRadius: "16px", border: "1px solid rgba(255,255,255,.1)",
                backgroundColor: "rgba(255,255,255,.06)", padding: "24px 20px",
              }}>
                <p style={{ margin: 0, color: "#34d399", fontSize: "60px", fontWeight: 900, letterSpacing: "-.06em", lineHeight: 1 }}>{resultTaps}</p>
                <p style={{ margin: "8px 0 0", color: "#cbd5e1", fontSize: "12px", fontWeight: 700, letterSpacing: ".18em" }}>TOTAL TAPS</p>
              </div>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden",
                borderRadius: "12px", border: "1px solid rgba(255,255,255,.1)", backgroundColor: "rgba(2,6,23,.45)",
              }}>
                <div style={{ padding: "16px", borderRight: "1px solid rgba(255,255,255,.1)" }}>
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em" }}>Duration</p>
                  <p style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: 800 }}>{testDuration} sec</p>
                </div>
                <div style={{ padding: "16px" }}>
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em" }}>Taps / Sec</p>
                  <p style={{ margin: "4px 0 0", color: "#fde68a", fontSize: "18px", fontWeight: 800 }}>{speed.toFixed(2)}</p>
                </div>
              </div>
              <p style={{ margin: "24px 0 0", color: "#64748b", fontSize: "12px" }}>Pocket Tools Kit · Tap Speed Test</p>
            </div>

            <Button onClick={downloadScore} disabled={downloading} className="h-12 w-full rounded-xl bg-sky-400 font-bold text-slate-950 hover:bg-sky-300">
              <Download className="h-4 w-4" />
              {downloading ? "Creating Image…" : "Download Score Image"}
            </Button>
            {downloadError && <p className="text-center text-sm text-red-300">{downloadError}</p>}
            <Button
              variant="ghost"
              onClick={() => setResultOpen(false)}
              className="h-10 w-full text-slate-300 hover:bg-white/10 hover:text-white"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ToolLayout>
  );
}

function StatCard({
  label,
  value,
  icon,
  urgent = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  urgent?: boolean;
}) {
  return (
    <div className={cn("rounded-2xl border bg-muted/30 p-4", urgent && "border-red-400 bg-red-50 dark:bg-red-950/20")}>
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <p className={cn("mt-2 text-3xl font-black tabular-nums", urgent && "text-red-500")}>{value}</p>
    </div>
  );
}