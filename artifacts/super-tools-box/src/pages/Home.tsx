import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShieldCheck, ChevronRight } from "lucide-react";
import { toolsData, ToolItem } from "@/data/tools";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppContext } from "@/context/AppContext";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Home() {
  const { t } = useTranslation();
  const { language } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredTools = useMemo(() => {
    if (!searchQuery) return toolsData;
    const q = searchQuery.toLowerCase();
    return toolsData.filter((tool) => 
      tool.title[language].toLowerCase().includes(q) || 
      tool.description[language].toLowerCase().includes(q)
    );
  }, [searchQuery, language]);

  const categories = useMemo(() => {
    const cats = new Map<string, ToolItem[]>();
    toolsData.forEach(tool => {
      if (!cats.has(tool.category)) {
        cats.set(tool.category, []);
      }
      cats.get(tool.category)?.push(tool);
    });
    return cats;
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 text-center max-w-4xl relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary mb-8"
          >
            <ShieldCheck className="h-4 w-4" />
            <span className="text-sm font-medium">{t("hero.trust")}</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
          >
            {t("hero.title")}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
          >
            {t("hero.subtitle")}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-xl mx-auto relative group"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              className="pl-12 h-14 text-lg rounded-2xl shadow-sm border-muted-foreground/20 focus-visible:ring-primary"
              placeholder={t("search.placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8 mb-20" id="tools">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-12">
            <TabsList className="p-1 bg-muted/50 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg px-6 text-base">{t("tabs.all")}</TabsTrigger>
              <TabsTrigger value="categories" className="rounded-lg px-6 text-base">{t("tabs.categories")}</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="mt-0 outline-none">
            {filteredTools.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                No tools found matching your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredTools.map((tool, index) => (
                    <ToolCard key={tool.id} tool={tool} index={index} language={language} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="categories" className="mt-0 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from(categories.entries()).map(([catName, tools], i) => (
                <motion.div 
                  key={catName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    {/* @ts-ignore */}
                    {t(`cat.${catName.toLowerCase()}`)}
                    <span className="text-sm px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-normal">
                      {tools.length}
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {tools.map(tool => (
                      <Link key={tool.id} href={`/tools/${tool.id}`}>
                        <div className="group p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all flex items-center gap-4 cursor-pointer">
                          <div className={`p-2.5 rounded-lg text-white ${tool.color}`}>
                            <tool.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 font-medium group-hover:text-primary transition-colors">
                            {tool.title[language]}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

function ToolCard({ tool, index, language }: { tool: ToolItem, index: number, language: "en" | "ml" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
    >
      <Link href={`/tools/${tool.id}`}>
        <div className="group h-full flex flex-col p-6 rounded-2xl border bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl text-white shadow-sm ${tool.color}`}>
              <tool.icon className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
            {tool.title[language]}
          </h3>
          <p className="text-muted-foreground flex-1 mb-4">
            {tool.description[language]}
          </p>
          <div className="mt-auto flex items-center text-sm font-medium text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
            Open Tool <ChevronRight className="h-4 w-4 ml-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
