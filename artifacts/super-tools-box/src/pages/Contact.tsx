import { useTranslation } from "@/hooks/useTranslation";
import { Link } from "wouter";
import { ArrowLeft, Mail, Github, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Contact() {
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
        <h1 className="text-4xl font-bold mb-8">{t("page.contact.title")}</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground">
              Have a question, feedback, or a suggestion for a new tool? Feel free to reach out.
            </p>
            
            <div className="space-y-4 pt-4">
              <a 
                href="mailto:adhilramees23@gmail.com" 
                className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:border-primary/50 transition-colors"
              >
                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-medium">Email Us</div>
                  <div className="text-sm text-muted-foreground">adhilramees23@gmail.com</div>
                </div>
              </a>
            </div>
          </div>
          
          <div className="bg-muted/30 p-8 rounded-2xl border flex flex-col justify-center items-center text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-2">Build Better Tools</h3>
            <p className="text-muted-foreground text-sm">
              We are constantly looking to improve Super Tools Box. Your feedback helps us make it better for everyone.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
