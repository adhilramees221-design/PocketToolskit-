import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Type, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TextCounter() {
  const [text, setText] = useState("");
  const [stats, setStats] = useState({ words: 0, chars: 0, charsNoSpaces: 0, lines: 0 });
  const { toast } = useToast();

  useEffect(() => {
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
    
    setStats({ words, chars, charsNoSpaces, lines });
  }, [text]);

  const copyText = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard.",
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleCaseChange = (type: 'upper' | 'lower' | 'title' | 'sentence' | 'alternating') => {
    if (!text) return;
    let newText = text;
    
    switch (type) {
      case 'upper':
        newText = text.toUpperCase();
        break;
      case 'lower':
        newText = text.toLowerCase();
        break;
      case 'title':
        newText = text.toLowerCase().split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        break;
      case 'sentence':
        newText = text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase());
        break;
      case 'alternating':
        newText = text.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
        break;
    }
    
    setText(newText);
  };

  return (
    <ToolLayout toolId="text-cnt" 
      instructions={
        <ul className="list-disc pl-5">
          <li>Type or paste your text into the area provided.</li>
          <li>Statistics like word count and character count update instantly.</li>
          <li>Use the format buttons to instantly change the case of your entire text.</li>
          <li>Click the copy button to save the result to your clipboard.</li>
        </ul>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-primary">{stats.words}</div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">Words</div>
          </div>
          <div className="bg-muted border rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{stats.chars}</div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">Characters</div>
          </div>
          <div className="bg-muted border rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{stats.charsNoSpaces}</div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">w/o Spaces</div>
          </div>
          <div className="bg-muted border rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{stats.lines}</div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">Lines</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={() => handleCaseChange('upper')}>UPPERCASE</Button>
          <Button variant="outline" size="sm" onClick={() => handleCaseChange('lower')}>lowercase</Button>
          <Button variant="outline" size="sm" onClick={() => handleCaseChange('title')}>Title Case</Button>
          <Button variant="outline" size="sm" onClick={() => handleCaseChange('sentence')}>Sentence case</Button>
          <Button variant="outline" size="sm" onClick={() => handleCaseChange('alternating')}>aLtErNaTiNg</Button>
        </div>

        <div className="relative">
          <Textarea 
            placeholder="Type or paste your text here..." 
            className="min-h-[300px] resize-y p-4 text-base rounded-xl bg-card border-2 focus-visible:ring-0 focus-visible:border-primary shadow-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => setText("")} className="gap-2">
            <Trash2 className="h-4 w-4 text-destructive" /> Clear
          </Button>
          <Button onClick={copyText} className="gap-2">
            <Copy className="h-4 w-4" /> Copy Text
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}
