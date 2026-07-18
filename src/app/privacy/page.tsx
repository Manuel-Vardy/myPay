"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/legal?tab=privacy-policy");
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center text-slate-500 font-medium">
      Redirecting to Privacy Policy...
    </div>
  );
}

