"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import Script from "next/script";

const languages = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "zh-CN", label: "Chinese" },
];

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if there's a googtrans cookie
    const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
    if (match && match[1]) {
      setCurrentLang(match[1]);
    }
  }, []);

  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (langCode: string) => {
    setIsOpen(false);
    if (langCode === "en") {
      // clear cookie
      // eslint-disable-next-line react-hooks/immutability
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      // eslint-disable-next-line react-hooks/immutability
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    } else {
      // eslint-disable-next-line react-hooks/immutability
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      // eslint-disable-next-line react-hooks/immutability
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname};`;
    }
    window.location.reload();
  };

  if (!mounted) return null;

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  return (
    <>
      <Script
        id="google-translate-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,fr,es,zh-CN',
                autoDisplay: false
              }, 'google_translate_element');
            }
          `,
        }}
      />
      <Script
        id="google-translate-script"
        strategy="afterInteractive"
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      />
      
      {/* Hidden element for Google Translate to attach to */}
      <div id="google_translate_element" className="hidden"></div>

      <div className="relative flex items-center">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-gray-700/80 hover:bg-gray-700 text-white transition-all backdrop-blur-sm"
          aria-label="Change Language"
        >
          <Globe className="h-5 w-5 text-blue-400" />
          <span className="text-sm font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-yellow-400 bg-clip-text text-transparent">
            {currentLanguage.label}
          </span>
          <svg className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Dropdown - Uses state */}
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <div className="absolute right-0 top-full mt-2 w-52 origin-top-right rounded-none bg-black shadow-2xl ring-1 ring-white/10 focus:outline-none z-50 overflow-hidden notranslate">
              <div className="px-4 py-3 bg-black border-b border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Language</span>
              </div>
              <div className="py-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
                      currentLang === lang.code 
                        ? "font-bold text-white bg-[#22c55e]/20 border-l-2 border-[#22c55e]" 
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <span>{lang.label}</span>
                    {currentLang === lang.code && (
                      <svg className="h-4 w-4 text-[#22c55e]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
