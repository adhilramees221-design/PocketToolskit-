import { 
  Image as ImageIcon, 
  Youtube, 
  FileText, 
  Key, 
  QrCode, 
  ArrowRightLeft, 
  Calculator, 
  Type, 
  Calendar, 
  Gauge,
  MessageCircle,
  Sparkles,
  Volume2,
  Receipt,
  FilePlus2
} from "lucide-react";

export type ToolCategory = "Media" | "Utilities" | "Documents" | "Security" | "Calculators";

export interface ToolItem {
  id: string;
  title: { en: string; ml: string };
  description: { en: string; ml: string };
  category: ToolCategory;
  icon: any;
  color: string;
}

export const toolsData: ToolItem[] = [
  {
    id: "img-comp",
    title: { en: "Image Compressor", ml: "ഇമേജ് കംപ്രസ്സർ" },
    description: { en: "Compress images locally without losing quality.", ml: "ക്വാളിറ്റി നഷ്ടപ്പെടാതെ ചിത്രങ്ങൾ കംപ്രസ് ചെയ്യുക." },
    category: "Media",
    icon: ImageIcon,
    color: "bg-blue-500",
  },
  {
    id: "yt-thumb",
    title: { en: "YouTube Thumbnail", ml: "യൂട്യൂബ് ലഘുചിത്രം" },
    description: { en: "Download high-quality thumbnails from any YouTube video.", ml: "ഏതെങ്കിലും യൂട്യൂബ് വീഡിയോയിൽ നിന്ന് ലഘുചിത്രങ്ങൾ ഡൗൺലോഡ് ചെയ്യുക." },
    category: "Utilities",
    icon: Youtube,
    color: "bg-red-500",
  },
  {
    id: "pdf-conv",
    title: { en: "Images to PDF", ml: "ചിത്രങ്ങൾ PDF ആക്കുക" },
    description: { en: "Convert multiple images into a single PDF document.", ml: "ഒന്നിലധികം ചിത്രങ്ങൾ ഒറ്റ PDF ഡോക്യുമെൻ്റാക്കി മാറ്റുക." },
    category: "Documents",
    icon: FileText,
    color: "bg-orange-500",
  },
  {
    id: "pass-gen",
    title: { en: "Password Generator", ml: "പാസ്‌വേഡ് ജനറേറ്റർ" },
    description: { en: "Generate strong, secure passwords instantly.", ml: "ശക്തവും സുരക്ഷിതവുമായ പാസ്‌വേഡുകൾ തൽക്ഷണം സൃഷ്ടിക്കുക." },
    category: "Security",
    icon: Key,
    color: "bg-emerald-500",
  },
  {
    id: "qr-code",
    title: { en: "QR Code Generator & Scanner", ml: "ക്യുആർ കോഡ് ജനറേറ്റർ & സ്കാനർ" },
    description: { en: "Create QR codes and scan them with camera or image upload.", ml: "ക്യുആർ കോഡ് ഉണ്ടാക്കുകയും ക്യാമറ അല്ലെങ്കിൽ ഇമേജ് വഴി സ്കാൻ ചെയ്യുകയും ചെയ്യുക." },
    category: "Utilities",
    icon: QrCode,
    color: "bg-purple-500",
  },
  {
    id: "unit-conv",
    title: { en: "Unit Converter", ml: "യൂണിറ്റ് കൺവെർട്ടർ" },
    description: { en: "Convert between various measurement units.", ml: "വിവിധ അളവുകൾ തമ്മിൽ മാറ്റുക." },
    category: "Calculators",
    icon: ArrowRightLeft,
    color: "bg-indigo-500",
  },
  {
    id: "fin-calc",
    title: { en: "EMI & Loan Calculator", ml: "ഇഎംഐ കാൽക്കുലേറ്റർ" },
    description: { en: "Calculate your monthly EMI and loan details.", ml: "നിങ്ങളുടെ പ്രതിമാസ ഇഎംഐ കണക്കാക്കുക." },
    category: "Calculators",
    icon: Calculator,
    color: "bg-cyan-500",
  },
  {
    id: "text-cnt",
    title: { en: "Case Converter & Counter", ml: "ടെക്സ്റ്റ് കൗണ്ടർ" },
    description: { en: "Count words, characters, and change text case.", ml: "വാക്കുകളും അക്ഷരങ്ങളും എണ്ണുക, അക്ഷരങ്ങളുടെ വലിപ്പം മാറ്റുക." },
    category: "Documents",
    icon: Type,
    color: "bg-slate-500",
  },
  {
    id: "age-calc",
    title: { en: "Age Calculator", ml: "വയസ്സ് കാൽക്കുലേറ്റർ" },
    description: { en: "Find your exact age in years, months, and days.", ml: "വർഷങ്ങളും മാസങ്ങളും ദിവസങ്ങളും ഉൾപ്പെടെ നിങ്ങളുടെ കൃത്യമായ പ്രായം കണ്ടെത്തുക." },
    category: "Calculators",
    icon: Calendar,
    color: "bg-pink-500",
  },
  {
    id: "speed-tst",
    title: { en: "Speed Tester", ml: "സ്പീഡ് ടെസ്റ്റർ" },
    description: { en: "Check your internet connection speed.", ml: "നിങ്ങളുടെ ഇൻ്റർനെറ്റ് വേഗത പരിശോധിക്കുക." },
    category: "Utilities",
    icon: Gauge,
    color: "bg-yellow-500",
  },
  // ── New Tools ──
  {
    id: "wa-chat",
    title: { en: "WhatsApp Direct Chat", ml: "വാട്സ്ആപ്പ് ഡയറക്ട് ചാറ്റ്" },
    description: { en: "Open a WhatsApp chat without saving the number to contacts.", ml: "നമ്പർ സേവ് ചെയ്യാതെ WhatsApp-ൽ ചാറ്റ് ചെയ്യുക." },
    category: "Utilities",
    icon: MessageCircle,
    color: "bg-green-500",
  },
  {
    id: "fancy-font",
    title: { en: "Fancy Font Generator", ml: "ഫാൻസി ഫോൺ്ട് ജനറേറ്റർ" },
    description: { en: "Convert text into 12+ stylish Unicode fonts for social media.", ml: "ടെക്സ്റ്റ് 12+ സ്റ്റൈലിഷ് ഫോൺ്ടുകളിലേക്ക് മാറ്റി കോപ്പി ചെയ്യുക." },
    category: "Utilities",
    icon: Sparkles,
    color: "bg-fuchsia-500",
  },
  {
    id: "tts",
    title: { en: "Text to Speech", ml: "ടെക്സ്റ്റ് ടു സ്പീച്ച്" },
    description: { en: "Convert any text to voice audio using your browser.", ml: "ഏത് ടെക്സ്റ്റും ബ്രൗസർ വഴി ശബ്‌ദമാക്കി കേൾക്കുക." },
    category: "Utilities",
    icon: Volume2,
    color: "bg-amber-500",
  },
  {
    id: "gst-calc",
    title: { en: "GST & Discount Calculator", ml: "ജിഎസ്ടി & ഡിസ്കൗണ്ട് കാൽക്കുലേറ്റർ" },
    description: { en: "Calculate GST, CGST, SGST and discounts instantly.", ml: "GST, CGST, SGST, ഡിസ്കൗണ്ട് തൽക്ഷണം കണക്കാക്കുക." },
    category: "Calculators",
    icon: Receipt,
    color: "bg-teal-500",
  },
  {
    id: "pdf-merge",
    title: { en: "PDF Merger", ml: "PDF മർജർ" },
    description: { en: "Merge multiple PDF files into one — runs entirely in your browser.", ml: "ഒന്നിലധികം PDF ഒന്നിച്ച് ചേർക്കുക — ഫയലുകൾ ഒരിടത്തും അപ്‌ലോഡ് ചെയ്യില്ല." },
    category: "Documents",
    icon: FilePlus2,
    color: "bg-rose-500",
  },
];
