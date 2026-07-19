import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Upload, FileDown, X } from "lucide-react";
import { jsPDF } from "jspdf";

export default function PdfConverter() {
  const [images, setImages] = useState<{ url: string; file: File }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files).map((file) => ({
      url: URL.createObjectURL(file),
      file
    }));

    setImages((prev) => [...prev, ...newImages]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImgs = [...prev];
      URL.revokeObjectURL(newImgs[index].url);
      newImgs.splice(index, 1);
      return newImgs;
    });
  };

  const generatePDF = async () => {
    if (images.length === 0) return;
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF();
      
      for (let i = 0; i < images.length; i++) {
        if (i > 0) pdf.addPage();
        
        const imgUrl = images[i].url;
        const img = new Image();
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imgUrl;
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgRatio = img.width / img.height;
        const pdfRatio = pdfWidth / pdfHeight;
        
        let finalWidth = pdfWidth;
        let finalHeight = pdfHeight;
        
        if (imgRatio > pdfRatio) {
          finalHeight = pdfWidth / imgRatio;
        } else {
          finalWidth = pdfHeight * imgRatio;
        }
        
        const x = (pdfWidth - finalWidth) / 2;
        const y = (pdfHeight - finalHeight) / 2;
        
        // Add image (canvas conversion helps with various formats)
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        pdf.addImage(dataUrl, 'JPEG', x, y, finalWidth, finalHeight);
      }
      
      pdf.save(`document_${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ToolLayout toolId="pdf-conv" 
      instructions={
        <ul className="list-disc pl-5">
          <li>Upload one or more images (JPG, PNG).</li>
          <li>Images will be added as pages in the order they appear.</li>
          <li>Click 'Generate PDF' to create and download the file.</li>
          <li>All processing happens locally. Your images are secure.</li>
        </ul>
      }
    >
      <div className="space-y-8">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30 transition-all rounded-2xl p-12 text-center cursor-pointer flex flex-col items-center gap-4"
        >
          <div className="bg-primary/10 p-4 rounded-full text-primary">
            <Upload className="h-8 w-8" />
          </div>
          <div>
            <p className="font-semibold text-lg">Add Images</p>
            <p className="text-sm text-muted-foreground mt-1">Select multiple images to combine into a PDF</p>
          </div>
        </div>

        <input 
          type="file" 
          accept="image/png, image/jpeg, image/webp" 
          multiple
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleUpload}
        />

        {images.length > 0 && (
          <div className="space-y-6 pt-6 border-t">
            <h3 className="font-medium flex items-center gap-2">
              Pages <span className="bg-muted px-2 py-0.5 rounded-md text-sm">{images.length}</span>
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative group aspect-[3/4] rounded-lg border bg-muted overflow-hidden">
                  <img src={img.url} alt={`Page ${index + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="h-8 w-8 rounded-full shadow-md"
                      onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded shadow-sm">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end pt-4">
              <Button 
                onClick={generatePDF} 
                disabled={isGenerating}
                size="lg"
                className="gap-2"
              >
                {isGenerating ? (
                  "Generating..."
                ) : (
                  <><FileDown className="h-5 w-5" /> Generate & Download PDF</>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
