"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/legal?tab=general-terms-of-use");
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center text-slate-500 font-medium">
      Redirecting to Terms of Service...
    </div>
  );
}

