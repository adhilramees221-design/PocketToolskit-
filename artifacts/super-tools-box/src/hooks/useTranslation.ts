import { useAppContext } from "@/context/AppContext";

export const translations = {
  en: {
    "nav.home": "Home",
    "nav.tools": "Tools",
    "nav.about": "About",
    "nav.privacy": "Privacy",
    "nav.contact": "Contact",
    "hero.trust": "100% Secure & Local. No Server Logs Saved.",
    "hero.title": "Your Daily Utility Toolkit",
    "hero.subtitle": "Powerful, private, and lightning-fast browser tools. Everything runs locally on your device.",
    "search.placeholder": "Search tools...",
    "tabs.all": "All Tools",
    "tabs.categories": "Categories",
    "footer.text": "© 2026 PocketToolskit. Created for premium speed and uncompromised local security.",
    "back.home": "Back to Dashboard",
    "tool.use": "How to Use",
    "cat.media": "Media",
    "cat.utilities": "Utilities",
    "cat.documents": "Documents",
    "cat.security": "Security",
    "cat.calculators": "Calculators",
    "page.about.title": "About PocketToolskit",
    "page.privacy.title": "Privacy Policy",
    "page.contact.title": "Contact Us",
  },
  ml: {
    "nav.home": "ഹോം",
    "nav.tools": "ടൂളുകൾ",
    "nav.about": "കുറിച്ച്",
    "nav.privacy": "സ്വകാര്യത",
    "nav.contact": "ബന്ധപ്പെടുക",
    "hero.trust": "100% സുരക്ഷിതം. നിങ്ങളുടെ വിവരങ്ങൾ ഒരിടത്തും ശേഖരിക്കപ്പെടുന്നില്ല.",
    "hero.title": "നിങ്ങളുടെ ദൈനംദിന ടൂൾകിറ്റ്",
    "hero.subtitle": "വേഗതയേറിയതും സുരക്ഷിതവുമായ ബ്രൗസർ ടൂളുകൾ. എല്ലാം നിങ്ങളുടെ ഉപകരണത്തിൽ തന്നെ പ്രവർത്തിക്കുന്നു.",
    "search.placeholder": "ടൂളുകൾ തിരയുക...",
    "tabs.all": "എല്ലാ ടൂളുകളും",
    "tabs.categories": "വിഭാഗങ്ങൾ",
    "footer.text": "© 2026 സൂപ്പർ ടൂൾസ് ബോക്സ്. മികച്ച വേഗതയ്ക്കും വിട്ടുവീഴ്ചയില്ലാത്ത സുരക്ഷയ്ക്കുമായി നിർമ്മിച്ചത്.",
    "back.home": "ഡാഷ്‌ബോർഡിലേക്ക് മടങ്ങുക",
    "tool.use": "എങ്ങനെ ഉപയോഗിക്കാം",
    "cat.media": "മീഡിയ",
    "cat.utilities": "യൂട്ടിലിറ്റീസ്",
    "cat.documents": "രേഖകൾ",
    "cat.security": "സുരക്ഷ",
    "cat.calculators": "കാൽക്കുലേറ്ററുകൾ",
    "page.about.title": "സൂപ്പർ ടൂൾസ് ബോക്സിനെക്കുറിച്ച്",
    "page.privacy.title": "സ്വകാര്യതാ നയം",
    "page.contact.title": "ഞങ്ങളെ ബന്ധപ്പെടുക",
  }
} as const;

export type TranslationKey = keyof typeof translations.en;

export function useTranslation() {
  const { language } = useAppContext();
  
  return {
    t: (key: TranslationKey | string) => {
      // @ts-ignore
      return translations[language][key] || translations.en[key] || key;
    }
  };
}
