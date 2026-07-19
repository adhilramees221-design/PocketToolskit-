import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Search, AlertCircle } from "lucide-react";

export default function YoutubeThumbnail() {
  const [url, setUrl] = useState("");
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [error, setError] = useState("");

  const extractVideoId = (inputUrl: string) => {
    try {
      const urlObj = new URL(inputUrl);
      if (urlObj.hostname.includes("youtube.com")) {
        return urlObj.searchParams.get("v");
      }
      if (urlObj.hostname === "youtu.be") {
        return urlObj.pathname.slice(1);
      }
      return null;
    } catch (e) {
      // Regex fallback
      const match = inputUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
      return match ? match[1] : null;
    }
  };

  const handleExtract = () => {
    setError("");
    const id = extractVideoId(url);
    
    if (id && id.length === 11) {
      setThumbnail(`https://img.youtube.com/vi/${id}/maxresdefault.jpg`);
    } else {
      setThumbnail(null);
      setError("Invalid YouTube URL. Please enter a valid video link.");
    }
  };

  const handleDownload = async () => {
    if (!thumbnail) return;
    try {
      // Fetch to convert to blob for proper downloading avoiding CORS issues if possible, 
      // but YouTube image server might block direct canvas conversion.
      // Easiest is to open in new tab or trigger download.
      const response = await fetch(thumbnail);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `youtube_thumbnail_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback for CORS
      window.open(thumbnail, '_blank');
    }
  };

  return (
    <ToolLayout toolId="yt-thumb" 
      instructions={
        <ul className="list-disc pl-5">
          <li>Copy the URL of any YouTube video.</li>
          <li>Paste it into the input field above.</li>
          <li>Click 'Extract Thumbnail' to fetch the highest resolution (MaxRes) image available.</li>
          <li>Click 'Download' to save the image to your device.</li>
        </ul>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="url">YouTube Video URL</Label>
          <div className="flex gap-3">
            <Input 
              id="url"
              placeholder="https://www.youtube.com/watch?v=..." 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
              className="flex-1"
            />
            <Button onClick={handleExtract} className="gap-2 shrink-0">
              <Search className="h-4 w-4" /> Extract
            </Button>
          </div>
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1 mt-2">
              <AlertCircle className="h-4 w-4" /> {error}
            </p>
          )}
        </div>

        {thumbnail && (
          <div className="space-y-4 pt-6 border-t animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-xl overflow-hidden border shadow-sm aspect-video bg-muted relative">
              <img 
                src={thumbnail} 
                alt="YouTube Thumbnail" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if maxresdefault doesn't exist
                  e.currentTarget.src = thumbnail.replace('maxresdefault', 'hqdefault');
                }}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleDownload} size="lg" className="gap-2">
                <Download className="h-4 w-4" /> Download Thumbnail (HD)
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
