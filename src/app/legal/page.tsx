"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";


// List of the 15 policy documents
const tabs = [
  { id: "privacy-policy", name: "Privacy Policy" },
  { id: "terms-of-reference", name: "Terms of Reference" },
  { id: "general-terms-of-use", name: "General Terms Of Use" },
  { id: "data-retention-and-protection-policy", name: "Data Retention and Protection Policy" },
  { id: "information-security-policy", name: "Information Security Policy" },
  { id: "overview", name: "Overview" },
  { id: "mobile-messaging-terms", name: "Mobile Messaging Terms" },
  { id: "refund-policy", name: "Refund Policy" },
  { id: "service-fees-policy", name: "Service Fees Policy" },
  { id: "consumer-protection-policy", name: "Consumer Protection Policy" },
  { id: "charge-back", name: "Charge Back" },
  { id: "api-docs", name: "API Docs" },
  { id: "anti-money-laundering-policy", name: "Anti Money Laundering Policy" },
  { id: "anti-fraud-policy", name: "Anti Fraud Policy" },
  { id: "warning-disclaimer-notice-of-non-liability-for-sharing-opt", name: "Warning-Disclaimer-Notice of Non-Liability for Sharing OPT" }
];

function LegalPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState("privacy-policy");

  useEffect(() => {
    if (tabParam) {
      const matched = tabs.find((t) => t.id === tabParam);
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
      default:
        const currentTab = tabs.find((t) => t.id === activeTab);
        return <PolicyPlaceholder title={currentTab ? currentTab.name : "Policy Document"} />;
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
            <p className="mt-3 text-base sm:text-lg text-slate-500 font-medium">
              Here are our terms of service.
            </p>
            
            {/* Logos under text */}
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
        <section className="py-10 bg-gray-50/50 min-h-[500px]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Horizontal Tabs List */}
            <div className="relative mb-10 pb-2 border-b border-black/[0.06]">
              <div className="overflow-x-auto no-scrollbar scroll-smooth flex items-center justify-start lg:justify-center gap-2 py-2 px-2 md:flex-wrap">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-full border transition-all duration-200 whitespace-nowrap cursor-pointer shrink-0 ${
                      activeTab === tab.id
                        ? "bg-[#22c55e] border-[#22c55e] text-white shadow-sm shadow-[#22c55e]/25"
                        : "bg-white border-black/[0.08] text-slate-700 hover:border-[#22c55e]/30 hover:text-black"
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content Area */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 sm:p-10 lg:p-12 transition-all duration-300">
              {renderContent()}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// -------------------------------------------------------------
// Content Sub-components
// -------------------------------------------------------------

const PrivacyPolicyContent = () => (
  <div className="space-y-8 animate-fade-in text-slate-700">
    <div className="space-y-3">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-black">Privacy Policy</h2>
      <p className="text-base sm:text-lg leading-relaxed text-slate-600 pt-2">
        Trite is committed to protecting your personal and business information. We collect and process data only where necessary to deliver secure payment services, comply with legal obligations, improve our platform, and provide customer support.
      </p>
    </div>

    <div className="border-t border-black/[0.06] pt-8 space-y-6">
      <h3 className="text-lg sm:text-xl font-bold text-black flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-[#22c55e]"></span>
        Information We Collect
      </h3>
      <p className="leading-relaxed text-sm sm:text-base">
        To provide our services effectively and comply with regulatory requirements, we collect various types of information, including:
      </p>
      <ul className="flex flex-col gap-3 text-slate-600 pl-2 text-sm sm:text-base">
        {[
          "Personal information (e.g., name, email address, phone number)",
          "Business information (e.g., business name, address, tax identification)",
          "Transaction data (e.g., amount, date, payment method, counterparty details)",
          "Device and browser information (e.g., IP address, operating system)",
          "Technical logs and system telemetry",
          "Usage analytics and navigation patterns"
        ].map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] mt-2 shrink-0"></span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>

    <div className="border-t border-black/[0.06] pt-8 space-y-6">
      <h3 className="text-lg sm:text-xl font-bold text-black flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-[#22c55e]"></span>
        How We Use Your Information
      </h3>
      <p className="leading-relaxed text-sm sm:text-base">
        We use the collected information for specific, legitimate business purposes:
      </p>
      <ul className="flex flex-col gap-3 text-slate-600 pl-2 text-sm sm:text-base">
        {[
          "Verifying identities and performing KYC compliance checks",
          "Processing payments and settling transaction amounts",
          "Preventing and detecting fraud, abuse, and security threats",
          "Meeting national and international regulatory obligations",
          "Improving and optimizing our products and service quality",
          "Providing responsive customer and merchant support"
        ].map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] mt-2 shrink-0"></span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>

    <div className="border-t border-black/[0.06] pt-8 space-y-4">
      <h3 className="text-lg sm:text-xl font-bold text-black flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-[#22c55e]"></span>
        Data Security
      </h3>
      <p className="leading-relaxed text-slate-600 text-sm sm:text-base">
        We employ bank-grade security protocols, including AES-256 encryption, secure cloud infrastructure, role-based access control, and continuous monitoring to protect your data. Trite does not sell your personal or financial data to third parties.
      </p>
    </div>

    <div className="border-t border-black/[0.06] pt-8 space-y-4">
      <h3 className="text-lg sm:text-xl font-bold text-black flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-[#22c55e]"></span>
        Your Rights
      </h3>
      <p className="leading-relaxed text-slate-600 text-sm sm:text-base">
        Subject to applicable regional laws, you have the right to request access to, correction of, or deletion of your personal data. You may withdraw consent at any time, subject to legal or contractual restrictions and reasonable notice.
      </p>
    </div>
  </div>
);

const GeneralTermsOfUseContent = () => (
  <div className="space-y-8 animate-fade-in text-slate-700">
    <div className="space-y-3">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-black">General Terms Of Use</h2>
      <p className="text-xs text-[#22c55e] font-bold tracking-wider uppercase">Last Updated: July 2026</p>
      <p className="text-base sm:text-lg leading-relaxed text-slate-600 pt-2">
        Welcome to Trite. These General Terms of Use govern your access to and use of our payment products, platform, APIs, website, and related financial gateway services. By accessing or using Trite, you agree to be bound by these terms.
      </p>
    </div>

    <div className="border-t border-black/[0.06] pt-8 space-y-4">
      <h3 className="text-lg sm:text-xl font-bold text-black flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-[#22c55e]"></span>
        Eligibility
      </h3>
      <p className="leading-relaxed text-slate-600 text-sm sm:text-base">
        You must be at least 18 years old (or the legal age of majority in your jurisdiction) and have the full legal capacity and authority to enter into these Terms on behalf of yourself or the entity you represent.
      </p>
    </div>

    <div className="border-t border-black/[0.06] pt-8 space-y-6">
      <h3 className="text-lg sm:text-xl font-bold text-black flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-[#22c55e]"></span>
        Acceptable Use Policy
      </h3>
      <p className="leading-relaxed text-sm sm:text-base">
        You agree to use Trite services only for lawful purposes. You shall not utilize our services, directly or indirectly, for:
      </p>
      <ul className="flex flex-col gap-3 text-slate-600 pl-2 text-sm sm:text-base">
        {[
          "Fraudulent, deceptive, or misleading transactions",
          "Money laundering or illicit finance facilitation",
          "Terrorist financing or weapons of mass destruction proliferation",
          "Unlawful gambling, narcotics, or prohibited merchandise",
          "Circumvention of local exchange controls or sanctions regulations",
          "Unauthorized reverse engineering, disruption, or API scraping"
        ].map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] mt-2 shrink-0"></span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>

    <div className="border-t border-black/[0.06] pt-8 space-y-4">
      <h3 className="text-lg sm:text-xl font-bold text-black flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-[#22c55e]"></span>
        Payment Processing & Settlements
      </h3>
      <p className="leading-relaxed text-slate-600 text-sm sm:text-base">
        Trite operates as a stablecoin-enabled payment service provider. All payments are processed in accordance with local banking guidelines, mobile money regulations (such as MTN/Telecel integrations), and blockchain ledger protocols. Settlement timelines and gateway fees are governed by your Merchant Service Agreement.
      </p>
    </div>

    <div className="border-t border-black/[0.06] pt-8 space-y-4">
      <h3 className="text-lg sm:text-xl font-bold text-black flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-[#22c55e]"></span>
        Service Availability & SLA
      </h3>
      <p className="leading-relaxed text-slate-600 text-sm sm:text-base">
        We aim to provide 99.99% system uptime. However, we do not guarantee continuous, uninterrupted access to our services. Scheduled maintenance, emergency repairs, and networks beyond our control may cause temporary disruptions.
      </p>
    </div>

    <div className="border-t border-black/[0.06] pt-8 space-y-4">
      <h3 className="text-lg sm:text-xl font-bold text-black flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-[#22c55e]"></span>
        Limitation of Liability
      </h3>
      <p className="leading-relaxed text-slate-600 text-sm sm:text-base">
        To the maximum extent permitted by applicable law, Trite, its directors, employees, and affiliates shall not be liable for any indirect, incidental, special, or consequential damages, including loss of profits, data, or goodwill, arising from or related to your use of our platform.
      </p>
    </div>

    <div className="border-t border-black/[0.06] pt-8 space-y-4">
      <h3 className="text-lg sm:text-xl font-bold text-black flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-[#22c55e]"></span>
        Amendments & Governing Law
      </h3>
      <p className="leading-relaxed text-slate-600 text-sm sm:text-base">
        We reserve the right to modify these Terms at any time. Continued use of Trite services following changes constitutes your agreement to the updated Terms. These Terms are governed by and construed in accordance with the laws of the Republic of Ghana.
      </p>
    </div>
  </div>
);

const PolicyPlaceholder = ({ title }: { title: string }) => (
  <div className="space-y-6 animate-fade-in text-center max-w-2xl mx-auto py-10">
    <div className="space-y-4">
      <h2 className="text-xl sm:text-3xl font-extrabold text-black leading-tight">{title}</h2>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
        Under Legal Review
      </div>
      <p className="text-sm sm:text-base leading-relaxed text-slate-600 pt-2">
        This document is currently undergoing comprehensive legal and compliance review by our risk department to ensure complete alignment with regional financial regulations.
      </p>
      <p className="text-xs sm:text-sm text-slate-400">
        The fully finalized version will be published and downloadable here shortly.
      </p>
    </div>
  </div>
);

// Default export wrapping page content in a Suspense boundary
export default function LegalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-500 font-medium">
        Loading legal page...
      </div>
    }>
      <LegalPageContent />
    </Suspense>
  );
}

