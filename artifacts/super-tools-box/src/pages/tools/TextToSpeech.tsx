import { useState, useEffect, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Play, Square, Volume2 } from "lucide-react";

export default function TextToSpeech() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!window.speechSynthesis) { setSupported(false); return; }
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      if (v.length && !selectedVoice) setSelectedVoice(v[0].name);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  const speak = () => {
    if (!text.trim() || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) utter.voice = voice;
    utter.rate = rate;
    utter.pitch = pitch;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  if (!supported) return (
    <ToolLayout toolId="tts" instructions={<p>Your browser does not support Text-to-Speech.</p>}>
      <p className="text-muted-foreground text-center py-8">Sorry, Text-to-Speech is not supported in this browser.</p>
    </ToolLayout>
  );

  return (
    <ToolLayout
      toolId="tts"
      instructions={
        <ul className="list-disc pl-5">
          <li>Type or paste any text in the box below.</li>
          <li>Choose a voice (language/accent) from the dropdown.</li>
          <li>Adjust Speed and Pitch sliders as needed.</li>
          <li>Click Play to hear it read aloud. Click Stop anytime.</li>
        </ul>
      }
    >
      <div className="max-w-xl mx-auto space-y-6">
        <div className="space-y-2">
          <Label htmlFor="tts-text">Text to Read</Label>
          <textarea
            id="tts-text"
            rows={5}
            placeholder="Type or paste your text here… (English, Malayalam, any language)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <p className="text-xs text-muted-foreground text-right">{text.length} characters</p>
        </div>

        {voices.length > 0 && (
          <div className="space-y-2">
            <Label>Voice</Label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Speed: {rate.toFixed(1)}×</Label>
            <input type="range" min="0.5" max="2" step="0.1" value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full accent-primary" />
          </div>
          <div className="space-y-2">
            <Label>Pitch: {pitch.toFixed(1)}</Label>
            <input type="range" min="0.5" max="2" step="0.1" value={pitch}
              onChange={(e) => setPitch(Number(e.target.value))}
              className="w-full accent-primary" />
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={speak} disabled={!text.trim() || isSpeaking} size="lg" className="flex-1 gap-2 font-semibold">
            <Play className="h-5 w-5" /> {isSpeaking ? "Speaking…" : "Play"}
          </Button>
          <Button onClick={stop} disabled={!isSpeaking} size="lg" variant="outline" className="gap-2">
            <Square className="h-5 w-5" /> Stop
          </Button>
        </div>

        {isSpeaking && (
          <div className="flex items-center justify-center gap-2 text-primary text-sm animate-pulse">
            <Volume2 className="h-4 w-4" /> Reading aloud…
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
