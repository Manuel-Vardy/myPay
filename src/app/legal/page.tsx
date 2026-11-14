"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import {
  WarningDisclaimerContent,
  AntiMoneyLaunderingContent,
  RefundPolicyContent,
  PrivacyPolicyContent,
  OverviewContent,
  MobileMessagingTermsContent,
  InformationSecurityPolicyContent,
  KycPolicyContent,
  GeneralTermsOfUseContent,
  ConsumerProtectionPolicyContent,
  ChargeBackContent,
  DataRetentionAndProtectionContent,
  ApiDocsContent,
  AntiFraudPolicyContent
} from "./policies-data";

// List of the 14 policy documents from official regulatory documentation
export const tabs = [
  { id: "privacy-policy", name: "Privacy Policy" },
  { id: "general-terms-of-use", name: "General Terms Of Use" },
  { id: "data-retention-and-protection-policy", name: "Data Retention and Protection" },
  { id: "information-security-policy", name: "Information Security Policy" },
  { id: "overview", name: "Overview (FAQ)" },
  { id: "mobile-messaging-terms", name: "Mobile Messaging Terms" },
  { id: "refund-policy", name: "Refund Policy" },
  { id: "consumer-protection-policy", name: "Consumer Protection Policy" },
  { id: "charge-back", name: "Charge Back" },
  { id: "api-docs", name: "API Docs" },
  { id: "anti-money-laundering-policy", name: "Anti Money Laundering Policy" },
  { id: "kyc-policy", name: "KYC Policy" },
  { id: "anti-fraud-policy", name: "Anti Fraud Policy" },
  { id: "warning-disclaimer-notice-of-non-liability-for-sharing-opt", name: "Warning Disclaimer Notice of Non-Liability for sharing OTP" }
];

function LegalPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState("privacy-policy");

  useEffect(() => {
    if (tabParam) {
      // Normalize aliases
      let targetTab = tabParam;
      if (tabParam === "warning-disclaimer-notice-of-non-liability-for-sharing-otp") {
        targetTab = "warning-disclaimer-notice-of-non-liability-for-sharing-opt";
      } else if (tabParam === "terms-of-reference" || tabParam === "service-fees-policy") {
        targetTab = "general-terms-of-use";
      }

      const matched = tabs.find((t) => t.id === targetTab);
      if (matched) {
        setActiveTab(matched.id);
      }
    }
  }, [tabParam]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    window.history.pushState(null, "", `/legal?tab=${tabId}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "privacy-policy":
        return <PrivacyPolicyContent />;
      case "general-terms-of-use":
        return <GeneralTermsOfUseContent />;
      case "data-retention-and-protection-policy":
        return <DataRetentionAndProtectionContent />;
      case "information-security-policy":
        return <InformationSecurityPolicyContent />;
      case "overview":
        return <OverviewContent />;
      case "mobile-messaging-terms":
        return <MobileMessagingTermsContent />;
      case "refund-policy":
        return <RefundPolicyContent />;
      case "consumer-protection-policy":
        return <ConsumerProtectionPolicyContent />;
      case "charge-back":
        return <ChargeBackContent />;
      case "api-docs":
        return <ApiDocsContent />;
      case "anti-money-laundering-policy":
        return <AntiMoneyLaunderingContent />;
      case "kyc-policy":
        return <KycPolicyContent />;
      case "anti-fraud-policy":
        return <AntiFraudPolicyContent />;
      case "warning-disclaimer-notice-of-non-liability-for-sharing-opt":
        return <WarningDisclaimerContent />;
      default:
        return <PrivacyPolicyContent />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-black selection:bg-[#22c55e]/30 selection:text-black overflow-x-hidden">
      <Header transparent={false} darkLogo={true} hideBorder={true} />

      <main className="pt-12 pb-16">
        {/* Top Header Section */}
        <section className="relative pt-10 pb-6 bg-white text-center">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black leading-tight">
              Trite is certified and regulated as a service provider.
            </h1>
            <p className="mt-3 text-base sm:text-lg text-black font-medium">
              Legal agreements, compliance frameworks, and terms of service.
            </p>
            
            {/* Regulatory Logos */}
            <div className="flex flex-wrap items-center justify-center gap-10 mt-6">
              <Image
                src="/images/DPC-logo-01-scaled.png"
                alt="Data Protection Commission Logo"
                width={180}
                height={55}
                className="h-11 sm:h-13 w-auto object-contain"
              />
              <Image
                src="/images/NCA.png"
                alt="National Communications Authority Logo"
                width={180}
                height={55}
                className="h-11 sm:h-13 w-auto object-contain"
              />
            </div>
          </div>
        </section>

        {/* Tab & Content Section */}
        <section className="py-8 bg-white min-h-[500px]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Horizontal Tabs List */}
            <div className="relative mb-8 pb-4 border-b border-black/[0.08]">
              <div className="overflow-x-auto no-scrollbar scroll-smooth flex items-center justify-start lg:justify-center gap-2 py-2 px-2 md:flex-wrap">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-full border transition-all duration-200 whitespace-nowrap cursor-pointer shrink-0 ${
                      activeTab === tab.id
                        ? "bg-black border-black text-white"
                        : "bg-white border-black/20 text-black hover:border-black"
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Content Area - Clean, natural document typography with no card wrapper */}
            <div className="max-w-4xl mx-auto py-4 text-black">
              {renderContent()}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// Default export wrapping page content in a Suspense boundary
export default function LegalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center text-black font-medium">
        Loading legal page...
      </div>
    }>
      <LegalPageContent />
    </Suspense>
  );
}
