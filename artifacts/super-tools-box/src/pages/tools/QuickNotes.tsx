import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Copy, Check, Download, Trash2, Save } from "lucide-react";

const STORAGE_KEY = "ptkQuickNotes";

export default function QuickNotes() {
  const [text, setText] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const lineCount = text ? text.split("\n").length : 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, text);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }, 800);
    return () => clearTimeout(timer);
  }, [text]);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `notes-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const clear = () => {
    if (text && confirm("Clear all notes?")) {
      setText("");
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <ToolLayout
      toolId="quick-note"
      instructions={
        <ul className="list-disc pl-5 space-y-1">
          <li>Type your notes, tasks, or ideas freely — auto-saved to your browser.</li>
          <li>Notes persist even after closing the tab.</li>
          <li>Copy to clipboard or download as a .txt file anytime.</li>
          <li>No account needed. Your notes never leave your device.</li>
        </ul>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{wordCount} words</span>
            <span>{charCount} chars</span>
            <span>{lineCount} lines</span>
            {saved && (
              <span className="flex items-center gap-1 text-green-600 text-xs">
                <Save className="h-3 w-3" /> Auto-saved
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={copy} className="gap-1" disabled={!text}>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy All"}
            </Button>
            <Button size="sm" variant="outline" onClick={download} className="gap-1" disabled={!text}>
              <Download className="h-4 w-4" /> Save .TXT
            </Button>
            <Button size="sm" variant="ghost" onClick={clear} className="gap-1 text-destructive hover:text-destructive" disabled={!text}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <textarea
          className="w-full min-h-[350px] p-4 rounded-xl border bg-muted/30 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
          placeholder="Start typing your notes, tasks, or ideas here...&#10;&#10;💡 Tips:&#10;- [ ] Use checkboxes like this&#10;- Auto-saves as you type&#10;- Works offline"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
    </ToolLayout>
  );
}
