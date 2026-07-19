import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Upload, Download, Image as ImageIcon } from "lucide-react";

export default function ImageCompressor() {
  const [image, setImage] = useState<string | null>(null);
  const [compressed, setCompressed] = useState<string | null>(null);
  const [quality, setQuality] = useState([60]);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setOriginalSize(file.size);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      compressImage(event.target?.result as string, quality[0] / 100);
    };
    reader.readAsDataURL(file);
  };

  const compressImage = (dataUrl: string, qualityVal: number) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      
      // Max 1200px
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;
      if (width > height && width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      } else if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);
      
      const compressedDataUrl = canvas.toDataURL("image/jpeg", qualityVal);
      setCompressed(compressedDataUrl);
      
      // Calculate approx size of base64
      const head = 'data:image/jpeg;base64,';
      const size = Math.round((compressedDataUrl.length - head.length) * 3 / 4);
      setCompressedSize(size);
    };
    img.src = dataUrl;
  };

  const handleQualityChange = (val: number[]) => {
    setQuality(val);
    if (image) {
      compressImage(image, val[0] / 100);
    }
  };

  const downloadImage = () => {
    if (!compressed) return;
    const link = document.createElement('a');
    link.href = compressed;
    link.download = `compressed_image_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ToolLayout toolId="img-comp" 
      instructions={
        <ul className="list-disc pl-5">
          <li>Upload any image file (JPEG, PNG, WebP).</li>
          <li>Adjust the quality slider to find the right balance between file size and image clarity.</li>
          <li>The image is processed securely in your browser—no data is uploaded to any server.</li>
          <li>Click Download to save the compressed image as a JPEG.</li>
        </ul>
      }
    >
      <div className="space-y-8">
        {!image ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30 transition-all rounded-2xl p-12 text-center cursor-pointer flex flex-col items-center gap-4"
          >
            <div className="bg-primary/10 p-4 rounded-full text-primary">
              <Upload className="h-8 w-8" />
            </div>
            <div>
              <p className="font-semibold text-lg">Click or drag image to upload</p>
              <p className="text-sm text-muted-foreground mt-1">Supports JPG, PNG, WebP</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-medium text-muted-foreground">Original</h3>
              <div className="relative aspect-video rounded-xl overflow-hidden border bg-muted flex items-center justify-center">
                <img src={image} alt="Original" className="object-contain w-full h-full" />
              </div>
              <p className="text-sm font-medium text-center">Size: {formatSize(originalSize)}</p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-muted-foreground flex items-center justify-between">
                <span>Compressed</span>
                <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full text-xs font-bold">
                  -{Math.round((1 - compressedSize / originalSize) * 100)}%
                </span>
              </h3>
              <div className="relative aspect-video rounded-xl overflow-hidden border bg-muted flex items-center justify-center">
                {compressed && <img src={compressed} alt="Compressed" className="object-contain w-full h-full" />}
              </div>
              <p className="text-sm font-medium text-center text-primary">Size: {formatSize(compressedSize)}</p>
            </div>
          </div>
        )}

        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleUpload}
        />

        {image && (
          <div className="space-y-6 pt-6 border-t">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Quality: {quality[0]}%</Label>
              </div>
              <Slider 
                value={quality} 
                onValueChange={handleQualityChange} 
                max={100} 
                min={10} 
                step={1} 
              />
            </div>
            
            <div className="flex gap-4">
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-1">
                Upload New Image
              </Button>
              <Button onClick={downloadImage} className="flex-1 gap-2">
                <Download className="h-4 w-4" /> Download Compressed
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
