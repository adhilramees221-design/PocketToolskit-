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
  Gauge 
} from "lucide-react";

export type ToolCategory = "Media" | "Utilities" | "Documents" | "Security" | "Calculators";

export interface ToolItem {
  id: string;
  title: {
    en: string;
    ml: string;
  };
  description: {
    en: string;
    ml: string;
  };
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
    title: { en: "QR Code Generator", ml: "ക്യുആർ കോഡ് ജനറേറ്റർ" },
    description: { en: "Create custom QR codes for links and text.", ml: "ലിങ്കുകൾക്കും ടെക്സ്റ്റിനുമായി ക്യുആർ കോഡുകൾ നിർമ്മിക്കുക." },
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
  }
];
