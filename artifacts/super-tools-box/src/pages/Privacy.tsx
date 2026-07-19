import { useTranslation } from "@/hooks/useTranslation";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href="/">
        <Button variant="ghost" className="mb-8 -ml-4 hover:bg-transparent hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back.home")}
        </Button>
      </Link>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-8">{t("page.privacy.title")}</h1>
        
        <div className="prose dark:prose-invert max-w-none space-y-6">
          <p className="text-lg font-medium text-primary">
            The short version: We do not collect, store, or process any of your personal data.
          </p>
          
          <h3>Data Processing</h3>
          <p>
            All tools provided by Super Tools Box operate entirely client-side. This means that when you compress an image, generate a PDF, or calculate something, the processing happens directly on your device's browser. No data is sent to any external server.
          </p>
          
          <h3>Local Storage</h3>
          <p>
            We use your browser's Local Storage solely to save your preferences, such as:
          </p>
          <ul>
            <li>Theme preference (Dark/Light mode)</li>
            <li>Language preference (English/Malayalam)</li>
          </ul>
          
          <h3>Analytics</h3>
          <p>
            We do not use any tracking scripts, analytics tools, or third-party cookies.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
