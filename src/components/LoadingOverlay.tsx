"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function LoadingOverlay() {
  const [loading, setLoading] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Prevent scrolling while loading
    document.body.style.overflow = "hidden";

    const handleLoad = () => {
      // Smooth delay so the user has time to appreciate the loader before transition
      const timer = setTimeout(() => {
        setLoading(false);
        const renderTimer = setTimeout(() => {
          setShouldRender(false);
          document.body.style.overflow = "";
        }, 500);
        return () => clearTimeout(renderTimer);
      }, 700);
      return () => clearTimeout(timer);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      // Fallback to guarantee the page is usable even if a third-party asset delays the load event
      const fallback = setTimeout(handleLoad, 3000);

      return () => {
        window.removeEventListener("load", handleLoad);
        clearTimeout(fallback);
      };
    }
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-2xl transition-all duration-500 ease-in-out ${
        loading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col items-center gap-10">
        {/* Trite logo on top */}
        <div className="relative transform hover:scale-105 transition-transform duration-300">
          <Image
            src="/tritee-logo.png"
            alt="Trite logo"
            width={160}
            height={38}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>

        {/* Newton's Cradle Loader */}
        <div className="newtons-cradle" aria-label="Loading page content">
          <div className="newtons-cradle__dot" />
          <div className="newtons-cradle__dot" />
          <div className="newtons-cradle__dot" />
          <div className="newtons-cradle__dot" />
        </div>
      </div>
    </div>
  );
}
