"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Test UI Helper Page
 * Redirects to a mock payment session for UI development
 */
export default function TestUIPage() {
  const router = useRouter();

  useEffect(() => {
    // Generate a test session ID for UI testing
    const testSessionId = "test-ui-" + Date.now();
    router.replace(`/pay/${testSessionId}`);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22c55e] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading test payment page...</p>
      </div>
    </div>
  );
}
