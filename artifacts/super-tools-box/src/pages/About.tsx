import { useTranslation } from "@/hooks/useTranslation";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function About() {
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
        <h1 className="text-4xl font-bold mb-8">{t("page.about.title")}</h1>
        
        <div className="prose dark:prose-invert max-w-none space-y-6">
          <p className="text-lg">
            Super Tools Box is a premium collection of browser-based utilities designed for speed, privacy, and ease of use.
          </p>
          <p>
            Unlike many online tools that upload your files, images, or data to a remote server, every tool in the Super Tools Box runs 100% locally in your browser. This means zero server logs, zero data collection, and instant results.
          </p>
          <h3>Our Philosophy</h3>
          <ul>
            <li><strong>Privacy First:</strong> Your data never leaves your device.</li>
            <li><strong>Speed:</strong> Local execution means no upload or download times.</li>
            <li><strong>Design:</strong> Tools should feel satisfying and premium to use.</li>
            <li><strong>Accessibility:</strong> Built to be fully bilingual (English & Malayalam).</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
