"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import Script from "next/script";

const languages = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
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
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    } else {
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname};`;
    }
    window.location.reload();
  };

  if (!mounted) return null;

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
                includedLanguages: 'en,fr,es',
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
          className={`flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--trite-muted)] hover:bg-black/5 hover:text-[color:var(--trite-ink)] transition-colors ${isOpen ? 'bg-black/5 text-[color:var(--trite-ink)]' : ''}`}
          aria-label="Change Language"
        >
          <Globe className="h-5 w-5" />
        </button>
        
        {/* Dropdown - Uses state */}
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <div className="absolute right-0 top-full mt-1 w-40 origin-top-right rounded-xl bg-white shadow-xl ring-1 ring-black/5 focus:outline-none z-50 overflow-hidden py-1">
              <div className="px-3 py-2 border-b border-black/5 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">Select Language</span>
              </div>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                    currentLang === lang.code ? "font-semibold text-[color:var(--trite-ink)] bg-[color:var(--trite-lime)]/10" : "text-gray-700"
                  }`}
                >
                  <span>{lang.label}</span>
                  {currentLang === lang.code && <div className="h-1.5 w-1.5 rounded-full bg-[color:var(--trite-lime-strong)]" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
