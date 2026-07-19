import { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toolsData } from "@/data/tools";
import { useAppContext } from "@/context/AppContext";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion } from "framer-motion";

interface ToolLayoutProps {
  children: ReactNode;
  instructions?: ReactNode;
  toolId: string;
}

export function ToolLayout({ children, instructions, toolId }: ToolLayoutProps) {
  const { language } = useAppContext();
  const { t } = useTranslation();
  
  const tool = toolsData.find(t => t.id === toolId);
  
  if (!tool) {
    return <div className="text-center py-20">Tool not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/">
        <Button variant="ghost" className="mb-8 -ml-4 hover:bg-transparent hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back.home")}
        </Button>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4 mb-8 pb-8 border-b">
          <div className={`p-4 rounded-2xl text-white shadow-md ${tool.color}`}>
            <tool.icon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{tool.title[language]}</h1>
            <p className="text-muted-foreground text-lg">{tool.description[language]}</p>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm mb-8">
          {children}
        </div>

        {instructions && (
          <Collapsible className="border rounded-2xl bg-card overflow-hidden">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-6 font-medium hover:bg-muted/50 transition-colors">
              <span className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                {t("tool.use")}
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-6 pt-0 border-t prose dark:prose-invert max-w-none">
                {instructions}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </motion.div>
    </div>
  );
}
