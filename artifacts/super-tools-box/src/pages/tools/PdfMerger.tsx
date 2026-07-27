import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { FilePlus2, Download, X, GripVertical, Loader2 } from "lucide-react";

interface PdfFile {
  id: string;
  name: string;
  size: string;
  file: File;
}

export default function PdfMerger() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const addFiles = useCallback((selected: FileList | null) => {
    if (!selected) return;
    const newFiles: PdfFile[] = Array.from(selected)
      .filter((f) => f.type === "application/pdf")
      .map((f) => ({
        id: `${f.name}-${f.lastModified}-${Math.random()}`,
        name: f.name,
        size: (f.size / 1024).toFixed(0) + " KB",
        file: f,
      }));
    setFiles((prev) => [...prev, ...newFiles]);
    setDone(false);
    setError("");
  }, []);

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setFiles((prev) => { const a = [...prev]; [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]]; return a; });
  };
  const moveDown = (idx: number) => {
    if (idx === files.length - 1) return;
    setFiles((prev) => { const a = [...prev]; [a[idx], a[idx + 1]] = [a[idx + 1], a[idx]]; return a; });
  };

  const merge = async () => {
    if (files.length < 2) { setError("Please add at least 2 PDF files to merge."); return; }
    setMerging(true);
    setError("");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const merged = await PDFDocument.create();
      for (const f of files) {
        const buf = await f.file.arrayBuffer();
        const doc = await PDFDocument.load(buf);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const bytes = await merged.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `merged_${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (e) {
      setError("Failed to merge PDFs. Make sure all files are valid PDF documents.");
    } finally {
      setMerging(false);
    }
  };

  return (
    <ToolLayout
      toolId="pdf-merge"
      instructions={
        <ul className="list-disc pl-5">
          <li>Click "Add PDF Files" to select one or more PDF files.</li>
          <li>Reorder them using the ↑ ↓ arrows — the merged output follows this order.</li>
          <li>Click "Merge & Download" to get a single combined PDF.</li>
          <li>Everything runs locally — your files never leave your device.</li>
        </ul>
      }
    >
      <div className="max-w-lg mx-auto space-y-6">
        {/* Upload button */}
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-2xl cursor-pointer bg-muted hover:bg-muted/70 transition-colors">
          <FilePlus2 className="h-8 w-8 text-muted-foreground mb-2" />
          <span className="text-sm font-semibold">Click to Add PDF Files</span>
          <span className="text-xs text-muted-foreground">You can add multiple files</span>
          <input type="file" accept="application/pdf" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
        </label>

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">{files.length} file{files.length > 1 ? "s" : ""} · drag to reorder</p>
            {files.map((f, idx) => (
              <div key={f.id} className="flex items-center gap-3 bg-muted rounded-xl px-3 py-3 border">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveUp(idx)} disabled={idx === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30 leading-none text-xs">▲</button>
                  <button onClick={() => moveDown(idx)} disabled={idx === files.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30 leading-none text-xs">▼</button>
                </div>
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.size}</p>
                </div>
                <span className="text-xs text-muted-foreground font-mono shrink-0">#{idx + 1}</span>
                <button onClick={() => removeFile(f.id)} className="text-muted-foreground hover:text-destructive ml-1">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
        {done && <p className="text-sm text-green-600 bg-green-50 dark:bg-green-950/30 rounded-lg px-3 py-2 text-center font-semibold">✅ Merged PDF downloaded!</p>}

        <Button onClick={merge} disabled={files.length < 2 || merging} size="lg" className="w-full gap-2 font-semibold">
          {merging ? <><Loader2 className="h-5 w-5 animate-spin" /> Merging…</> : <><Download className="h-5 w-5" /> Merge &amp; Download</>}
        </Button>
      </div>
    </ToolLayout>
  );
}
