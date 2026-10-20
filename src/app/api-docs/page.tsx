"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Book, Code, Terminal, Zap, Info, AlertTriangle } from "lucide-react";
import Link from "next/link";

const BASE_URL = "https://api.trite.tech";

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-xl bg-[#0f1419] p-4 text-[13px] leading-relaxed text-gray-100">
      <code>{children}</code>
    </pre>
  );
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-2xl font-black tracking-tight text-black mt-16 mb-4 scroll-mt-24 border-b border-gray-100 pb-2">
      {children}
    </h2>
  );
}

function SectionLabel({ children, type = "default" }: { children: React.ReactNode, type?: "request" | "response" | "parameters" | "default" }) {
  const colors = {
    request: "bg-blue-50 text-blue-600 border-blue-200",
    response: "bg-green-50 text-green-600 border-green-200",
    parameters: "bg-purple-50 text-purple-600 border-purple-200",
    default: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <div className={`inline-flex items-center px-2 py-1 rounded text-[11px] font-bold tracking-wider uppercase border mb-2 ${colors[type]}`}>
      {children}
    </div>
  );
}

function AlertBox({ title, children, type = "info" }: { title?: string, children: React.ReactNode, type?: "info" | "warning" }) {
  const isWarning = type === "warning";
  return (
    <div className={`my-6 rounded-xl p-4 border ${isWarning ? 'bg-amber-50 border-amber-200/50' : 'bg-blue-50/50 border-blue-100'}`}>
      <div className="flex items-start gap-3">
        {isWarning ? (
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        ) : (
          <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        )}
        <div>
          {title && <h4 className={`font-bold text-sm mb-1 ${isWarning ? 'text-amber-800' : 'text-blue-800'}`}>{title}</h4>}
          <div className={`text-sm leading-relaxed ${isWarning ? 'text-amber-700' : 'text-blue-700'}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

interface CodeTab {
  name: string;
  code: string;
}

function CodeTabs({ tabs }: { tabs: CodeTab[] }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="mt-4 rounded-xl bg-[#0f1419] overflow-hidden">
      <div className="flex items-center gap-1 border-b border-white/10 px-4 pt-3">
        {tabs.map((tab, idx) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(idx)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === idx 
                ? 'border-[#22c55e] text-white' 
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-gray-100 m-0">
        <code>{tabs[activeTab].code}</code>
      </pre>
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <Header transparent={false} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#22c55e] transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#22c55e]/30 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Code className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">API Reference</h3>
              <p className="text-gray-600 mb-6">Detailed information about endpoints, parameters, and responses.</p>
              <button className="text-sm font-bold text-[#22c55e] flex items-center group-hover:gap-2 transition-all">
                Explore Docs <ArrowLeft className="h-4 w-4 ml-1 rotate-270" />
              </button>
            </div>

            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#22c55e]/30 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Terminal className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">SDKs & Libraries</h3>
              <p className="text-gray-600 mb-6">Official libraries for Node.js, Python, PHP, and more.</p>
              <a href="#sdk">
                <button className="text-sm font-bold text-[#22c55e] flex items-center group-hover:gap-2 transition-all">
                  Download SDKs <ArrowLeft className="h-4 w-4 ml-1 rotate-270" />
                </button>
              </a>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-black mb-6">
            API Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
            Accept payments programmatically: create payment sessions, share checkout
            links with your customers, and receive signed webhooks when money moves.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 relative">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            
            <SectionTitle id="getting-started">Getting started</SectionTitle>
            <p className="text-gray-600 leading-relaxed mb-4">
              The API is served from <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">{BASE_URL}</code>.
              Create an API key in the dashboard under{" "}
              <span className="font-semibold text-black">Settings → Integrations → API Management</span>.
            </p>
            
            <AlertBox type="info" title="Format Info">
              All requests and responses are JSON. Amounts are decimal major units (e.g.{" "}
              <code className="rounded bg-blue-100/50 px-1.5 py-0.5 text-sm font-mono">25.50</code>) with an ISO
              currency code.
            </AlertBox>

            <SectionTitle id="authentication">Authentication</SectionTitle>
            <p className="text-gray-600 leading-relaxed mb-4">
              Pass your key as a bearer token on every request. Your merchant account is derived
              from the key — there is no merchant ID parameter.
            </p>
            
            <SectionLabel type="request">Header</SectionLabel>
            <CodeBlock>{`Authorization: Bearer trite_sk_...`}</CodeBlock>

            <AlertBox type="warning" title="Keep your API key secure">
              Missing or invalid keys receive <code className="rounded bg-amber-100 px-1.5 py-0.5 text-sm font-mono text-amber-900">401</code>.
              The full key is shown exactly once at creation — store it securely. Keys look like{" "}
              <code className="rounded bg-amber-100 px-1.5 py-0.5 text-sm font-mono text-amber-900">trite_sk_…</code> and can be
              revoked at any time. Never use your API key in browser or mobile code — server-side only.
            </AlertBox>

            <SectionTitle id="merchant-verification">Merchant verification</SectionTitle>
            <p className="text-gray-600 leading-relaxed mb-4">
              The{" "}
              <a href="#direct-charge" className="text-[#22c55e] font-semibold hover:underline">direct charge</a>{" "}
              endpoints move money on a payer&apos;s behalf, so they require your merchant account to be{" "}
              <strong>fully verified</strong>. This means:
            </p>
            <ol className="list-decimal ml-6 text-gray-600 leading-relaxed mb-4 space-y-2">
              <li><strong>Email verified</strong> — confirm your email address via the link sent at registration.</li>
              <li><strong>KYC approved</strong> — submit identity verification documents in the merchant portal under Settings and receive approval.</li>
            </ol>
            <p className="text-gray-600 leading-relaxed mb-4">
              If either requirement is not met, those calls return{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">403</code> with a
              machine-readable <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">code</code> field:
            </p>

            <SectionLabel type="response">HTTP 403 — Email Not Verified</SectionLabel>
            <CodeBlock>{`{
  "error": "Merchant account email is not verified. Please verify your email in the merchant portal.",
  "code": "EMAIL_NOT_VERIFIED"
}`}</CodeBlock>

            <div className="mt-6">
              <SectionLabel type="response">HTTP 403 — KYC Not Approved</SectionLabel>
              <CodeBlock>{`{
  "error": "Merchant KYC verification is required. Please complete identity verification in the merchant portal.",
  "code": "KYC_NOT_APPROVED",
  "kyc_status": "PENDING"
}`}</CodeBlock>
            </div>

            <AlertBox type="info" title="KYC Status Values">
              The <code className="rounded bg-blue-100/50 px-1.5 py-0.5 text-sm font-mono">kyc_status</code> field will be one of:{" "}
              <code className="rounded bg-blue-100/50 px-1.5 py-0.5 text-sm font-mono">PENDING</code>,{" "}
              <code className="rounded bg-blue-100/50 px-1.5 py-0.5 text-sm font-mono">IN_REVIEW</code>,{" "}
              <code className="rounded bg-blue-100/50 px-1.5 py-0.5 text-sm font-mono">APPROVED</code>,{" "}
              <code className="rounded bg-blue-100/50 px-1.5 py-0.5 text-sm font-mono">REJECTED</code>,{" "}
              <code className="rounded bg-blue-100/50 px-1.5 py-0.5 text-sm font-mono">EXPIRED</code>, or{" "}
              <code className="rounded bg-blue-100/50 px-1.5 py-0.5 text-sm font-mono">null</code> (no KYC record submitted yet).
              Only <code className="rounded bg-blue-100/50 px-1.5 py-0.5 text-sm font-mono">APPROVED</code> grants API access.
            </AlertBox>

            <SectionTitle id="create-session">Create a payment session</SectionTitle>
            <p className="text-gray-600 leading-relaxed mb-4">
              Creates a checkout session and returns a <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">payment_url</code>{" "}
              to hand to your customer. Sessions expire after 24 hours.
            </p>
            
            <SectionLabel type="request">POST /api/v1/payments/initiate</SectionLabel>
            <CodeTabs 
              tabs={[
                {
                  name: "cURL",
                  code: `curl ${BASE_URL}/api/v1/payments/initiate \\\n  -H "Authorization: Bearer trite_sk_..." \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "amount": 25.50,\n    "currency": "GHS",\n    "description": "Order #1234",\n    "redirect_url": "https://yourstore.com/thank-you",\n    "customer_email": "ama@example.com",\n    "customer_name": "Ama Serwaa",\n    "customer_phone": "0244123456"\n  }'`
                },
                {
                  name: "Node.js",
                  code: `const response = await fetch("${BASE_URL}/api/v1/payments/initiate", {\n  method: "POST",\n  headers: {\n    "Authorization": "Bearer trite_sk_...",\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify({\n    amount: 25.50,\n    currency: "GHS",\n    description: "Order #1234",\n    redirect_url: "https://yourstore.com/thank-you",\n    customer_email: "ama@example.com",\n    customer_name: "Ama Serwaa",\n    customer_phone: "0244123456"\n  })\n});\n\nconst data = await response.json();`
                },
                {
                  name: "Python",
                  code: `import requests\n\nresponse = requests.post(\n    "${BASE_URL}/api/v1/payments/initiate",\n    headers={"Authorization": "Bearer trite_sk_..."},\n    json={\n        "amount": 25.50,\n        "currency": "GHS",\n        "description": "Order #1234",\n        "redirect_url": "https://yourstore.com/thank-you",\n        "customer_email": "ama@example.com",\n        "customer_name": "Ama Serwaa",\n        "customer_phone": "0244123456"\n    }\n)\n\ndata = response.json()`
                }
              ]} 
            />
            
            <div className="mt-8">
              <SectionLabel type="response">HTTP 201 Created</SectionLabel>
              <CodeBlock>{`{
  "session_id": "3f6b1c9e-...",
  "payment_url": "https://pay.trite.tech/pay/3f6b1c9e-...",
  "amount": 25.5,
  "currency": "GHS",
  "expires_at": "2026-07-08T12:00:00.000Z"
}`}</CodeBlock>
              <p className="text-gray-600 leading-relaxed mt-4 text-sm">
                A session created without <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">customer_email</code> or{" "}
                <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">customer_phone</code> still succeeds, with a{" "}
                <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">warnings</code> array in the response. Treat those
                warnings as errors in waiting.
              </p>
            </div>

            <div className="mt-8">
              <SectionLabel type="parameters">Body Parameters</SectionLabel>
              <div className="overflow-x-auto rounded-xl border border-gray-100 mt-2">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Field</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-600">
                    <tr><td className="px-4 py-3 font-mono">amount</td><td className="px-4 py-3">number</td><td className="px-4 py-3">Required. Positive, major units.</td></tr>
                    <tr><td className="px-4 py-3 font-mono">currency</td><td className="px-4 py-3">string</td><td className="px-4 py-3">Optional, default USD.</td></tr>
                    <tr><td className="px-4 py-3 font-mono">description</td><td className="px-4 py-3">string</td><td className="px-4 py-3">Optional, shown at checkout.</td></tr>
                    <tr><td className="px-4 py-3 font-mono">redirect_url</td><td className="px-4 py-3">string</td><td className="px-4 py-3">Optional, payer is sent here after payment.</td></tr>
                    <tr><td className="px-4 py-3 font-mono">customer_email</td><td className="px-4 py-3">string</td><td className="px-4 py-3">Who is paying. <strong>Will become required</strong> — sessions without it are accepted for now and return a warning. Identifies the payer in your customer directory, and is the only identity we get on crypto payments.</td></tr>
                    <tr><td className="px-4 py-3 font-mono">customer_name</td><td className="px-4 py-3">string</td><td className="px-4 py-3">Optional. Shown in your customer directory.</td></tr>
                    <tr><td className="px-4 py-3 font-mono">customer_phone</td><td className="px-4 py-3">string</td><td className="px-4 py-3">Optional. Local or international format. Prefills the mobile money field at checkout, and is the strongest way to recognise a returning payer.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <AlertBox type="info">
              Errors: <code className="rounded bg-blue-100/50 px-1.5 py-0.5 text-sm font-mono">400</code> invalid input,{" "}
              <code className="rounded bg-blue-100/50 px-1.5 py-0.5 text-sm font-mono">401</code> bad key,{" "}
              <code className="rounded bg-blue-100/50 px-1.5 py-0.5 text-sm font-mono">403</code> merchant is not currently accepting payments,{" "}
              <code className="rounded bg-blue-100/50 px-1.5 py-0.5 text-sm font-mono">429</code> rate limited,{" "}
              <code className="rounded bg-blue-100/50 px-1.5 py-0.5 text-sm font-mono">500</code> server error.
            </AlertBox>

            <SectionTitle id="session-status">Check session status</SectionTitle>
            <p className="text-gray-600 leading-relaxed mb-4">
              Returns the session and its latest transaction. Prefer webhooks over polling for
              real-time updates.
            </p>
            
            <SectionLabel type="request">GET /api/v1/payments/{"{session_id}"}/status</SectionLabel>
            <CodeTabs 
              tabs={[
                {
                  name: "cURL",
                  code: `curl ${BASE_URL}/api/v1/payments/3f6b1c9e-.../status \\\n  -H "Authorization: Bearer trite_sk_..."`
                },
                {
                  name: "Node.js",
                  code: `const response = await fetch("${BASE_URL}/api/v1/payments/3f6b1c9e-.../status", {\n  headers: {\n    "Authorization": "Bearer trite_sk_..."\n  }\n});\n\nconst data = await response.json();`
                },
                {
                  name: "Python",
                  code: `import requests\n\nresponse = requests.get(\n    "${BASE_URL}/api/v1/payments/3f6b1c9e-.../status",\n    headers={"Authorization": "Bearer trite_sk_..."}\n)\n\ndata = response.json()`
                }
              ]} 
            />

            <div className="mt-8">
              <SectionLabel type="response">HTTP 200 OK</SectionLabel>
              <CodeBlock>{`{
  "session_id": "3f6b1c9e-...",
  "status": "COMPLETED",
  "amount": 25.5,
  "currency": "GHS",
  "description": "Order #1234",
  "expires_at": "2026-07-08T12:00:00.000Z",
  "created_at": "2026-07-07T12:00:00.000Z",
  "transaction": {
    "transaction_id": "9a2d...",
    "tx_id_display": "TX-8F3K2M",
    "status": "SETTLED",
    "method": "MOBILE_MONEY",
    "amount": 25.5,
    "currency": "GHS",
    "failure_reason": null
  }
}`}</CodeBlock>
            </div>

            <AlertBox type="warning">
              Sessions belonging to a different merchant return <code className="rounded bg-amber-100 px-1.5 py-0.5 text-sm font-mono text-amber-900">404</code>.
            </AlertBox>

            <SectionTitle id="direct-charge">Direct charge</SectionTitle>
            <p className="text-gray-600 leading-relaxed mb-4">
              Debit a mobile money wallet from your own backend, with no Trite-hosted checkout page.
              The payer approves the charge on their handset. Ghana mobile money only —{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">GHS</code> is the
              only supported currency.
            </p>

            <SectionLabel type="request">POST /api/v1/payments/charge</SectionLabel>
            <CodeTabs
              tabs={[
                {
                  name: "cURL",
                  code: `curl ${BASE_URL}/api/v1/payments/charge \\\n  -H "Authorization: Bearer trite_sk_..." \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "amount": 200,\n    "mobile_number": "0249713683",\n    "provider": "MTN",\n    "currency": "GHS",\n    "description": "Order #1234"\n  }'`
                },
                {
                  name: "Node.js",
                  code: `const response = await fetch("${BASE_URL}/api/v1/payments/charge", {\n  method: "POST",\n  headers: {\n    "Authorization": "Bearer trite_sk_...",\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify({\n    amount: 200,\n    mobile_number: "0249713683",\n    provider: "MTN",\n    currency: "GHS",\n    description: "Order #1234"\n  })\n});\n\nconst data = await response.json();`
                },
                {
                  name: "Python",
                  code: `import requests\n\nresponse = requests.post(\n    "${BASE_URL}/api/v1/payments/charge",\n    headers={"Authorization": "Bearer trite_sk_..."},\n    json={\n        "amount": 200,\n        "mobile_number": "0249713683",\n        "provider": "MTN",\n        "currency": "GHS",\n        "description": "Order #1234"\n    }\n)\n\ndata = response.json()`
                }
              ]}
            />

            <div className="mt-8">
              <SectionLabel type="response">HTTP 202 Accepted</SectionLabel>
              <CodeBlock>{`{
  "reference": "TX-8F3K2M-A1B2C3D4",
  "transaction_id": "9a2d...",
  "session_id": "3f6b1c9e-...",
  "status": "INITIATED",
  "amount": 200,
  "currency": "GHS",
  "message": "Payment prompt sent to your phone. Please approve it."
}`}</CodeBlock>
            </div>

            <div className="mt-8">
              <SectionLabel type="parameters">Body Parameters</SectionLabel>
              <div className="overflow-x-auto rounded-xl border border-gray-100 mt-2">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Field</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-600">
                    <tr><td className="px-4 py-3 font-mono">amount</td><td className="px-4 py-3">number</td><td className="px-4 py-3">Required. Positive, major units — <code className="font-mono">200</code> means GHS 200.00.</td></tr>
                    <tr><td className="px-4 py-3 font-mono">mobile_number</td><td className="px-4 py-3">string</td><td className="px-4 py-3">Required. The payer&apos;s mobile money number.</td></tr>
                    <tr><td className="px-4 py-3 font-mono">provider</td><td className="px-4 py-3">string</td><td className="px-4 py-3">Required. <code className="font-mono">MTN</code>, <code className="font-mono">TELECEL</code>, or <code className="font-mono">AT</code>. Not inferred from the number — a ported line would charge the wrong network.</td></tr>
                    <tr><td className="px-4 py-3 font-mono">currency</td><td className="px-4 py-3">string</td><td className="px-4 py-3">Optional, default <code className="font-mono">GHS</code>. No other value is accepted.</td></tr>
                    <tr><td className="px-4 py-3 font-mono">description</td><td className="px-4 py-3">string</td><td className="px-4 py-3">Optional, shown on the payer&apos;s prompt where the network supports it.</td></tr>
                    <tr><td className="px-4 py-3 font-mono">payer_email</td><td className="px-4 py-3">string</td><td className="px-4 py-3">Optional. Recorded against the transaction and added to your customer directory once the charge settles.</td></tr>
                    <tr><td className="px-4 py-3 font-mono">payer_name</td><td className="px-4 py-3">string</td><td className="px-4 py-3">Optional. Names the payer in your customer directory instead of showing a bare phone number.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8">
              <SectionLabel type="parameters">Response status values</SectionLabel>
              <div className="overflow-x-auto rounded-xl border border-gray-100 mt-2">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-4 py-3">status</th>
                      <th className="px-4 py-3">HTTP</th>
                      <th className="px-4 py-3">What to do</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-600">
                    <tr><td className="px-4 py-3 font-mono">INITIATED</td><td className="px-4 py-3">202</td><td className="px-4 py-3">The prompt is on the payer&apos;s handset. Wait for your webhook.</td></tr>
                    <tr><td className="px-4 py-3 font-mono">OTP_REQUIRED</td><td className="px-4 py-3">202</td><td className="px-4 py-3">Collect the OTP the payer was texted and submit it below.</td></tr>
                    <tr><td className="px-4 py-3 font-mono">FAILED</td><td className="px-4 py-3">422</td><td className="px-4 py-3">The charge was rejected outright. <code className="font-mono">message</code> says why.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed mt-8 mb-4">
              When a charge returns{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">OTP_REQUIRED</code>,
              submit the code against the same reference. The response uses the shapes above.
            </p>

            <SectionLabel type="request">POST /api/v1/payments/charge/submit-otp</SectionLabel>
            <CodeBlock>{`curl ${BASE_URL}/api/v1/payments/charge/submit-otp \\
  -H "Authorization: Bearer trite_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "reference": "TX-8F3K2M-A1B2C3D4",
    "otp": "123456"
  }'`}</CodeBlock>

            <p className="text-gray-600 leading-relaxed mt-8 mb-4">
              To read a charge&apos;s current state, use its reference. Terminal states are{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">SETTLED</code> and{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">FAILED</code>.
            </p>

            <SectionLabel type="request">GET /api/v1/payments/charge/{"{reference}"}</SectionLabel>
            <CodeBlock>{`curl ${BASE_URL}/api/v1/payments/charge/TX-8F3K2M-A1B2C3D4 \\
  -H "Authorization: Bearer trite_sk_..."`}</CodeBlock>

            <div className="mt-8">
              <SectionLabel type="response">HTTP 200 OK</SectionLabel>
              <CodeBlock>{`{
  "reference": "TX-8F3K2M-A1B2C3D4",
  "transaction_id": "9a2d...",
  "session_id": "3f6b1c9e-...",
  "status": "SETTLED",
  "amount": 200,
  "currency": "GHS",
  "method": "MOBILE_MONEY",
  "failure_reason": null,
  "created_at": "2026-08-09T14:21:07.412Z",
  "updated_at": "2026-08-09T14:21:44.907Z"
}`}</CodeBlock>
              <p className="text-gray-600 leading-relaxed mt-4">
                <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">status</code> is{" "}
                <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">INITIATED</code> while
                the payer still has the prompt, then{" "}
                <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">SETTLED</code> or{" "}
                <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">FAILED</code>.{" "}
                <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">failure_reason</code>{" "}
                is populated only on the latter.
              </p>
            </div>

            <AlertBox type="info" title="Prefer webhooks over polling">
              Mobile money settles asynchronously — a payer may approve the prompt minutes after your
              request returned. The{" "}
              <a href="#webhooks" className="text-[#22c55e] font-semibold hover:underline">payment.success</a>{" "}
              webhook is the recommended completion signal and carries the same{" "}
              <code className="rounded bg-blue-100/50 px-1.5 py-0.5 text-sm font-mono">tx_id_display</code>{" "}
              as your <code className="rounded bg-blue-100/50 px-1.5 py-0.5 text-sm font-mono">reference</code>.
              If you do poll, poll every 3–5 seconds and stop after about five minutes.
            </AlertBox>

            <AlertBox type="warning">
              Direct charge requires a verified merchant — see{" "}
              <a href="#merchant-verification" className="text-[#22c55e] font-semibold hover:underline">Merchant verification</a>.
              Charges belonging to a different merchant return{" "}
              <code className="rounded bg-amber-100 px-1.5 py-0.5 text-sm font-mono text-amber-900">404</code>.
              Submitting an OTP against a charge that is no longer awaiting one returns{" "}
              <code className="rounded bg-amber-100 px-1.5 py-0.5 text-sm font-mono text-amber-900">409</code>.
            </AlertBox>

            <SectionTitle id="webhooks">Webhooks</SectionTitle>
            <p className="text-gray-600 leading-relaxed mb-4">
              Configure your endpoint URL and event subscriptions in{" "}
              <span className="font-semibold text-black">Settings → Integrations → Webhook Configuration</span>.
              Events are delivered as POST requests with a JSON envelope:
            </p>
            
            <SectionLabel type="request">POST (To your server)</SectionLabel>
            <CodeTabs 
              tabs={[
                {
                  name: "payment.success",
                  code: `{\n  "id": "evt_5c1a...",\n  "type": "payment.success",\n  "created_at": "2026-07-07T12:03:41.000Z",\n  "data": {\n    "tx_id_display": "TX-8F3K2M",\n    "session_id": "3f6b1c9e-...",\n    "amount": 25.5,\n    "currency": "GHS",\n    "method": "MOBILE_MONEY",\n    "status": "SETTLED"\n  }\n}`
                },
                {
                  name: "payment.failed",
                  code: `{\n  "id": "evt_9b2c...",\n  "type": "payment.failed",\n  "created_at": "2026-07-07T12:05:12.000Z",\n  "data": {\n    "tx_id_display": "TX-9G4L3N",\n    "session_id": "8d7f2a1b-...",\n    "amount": 50.0,\n    "currency": "USD",\n    "method": "CARD",\n    "status": "FAILED",\n    "failure_reason": "Insufficient funds"\n  }\n}`
                },
                {
                  name: "payout.success",
                  code: `{\n  "id": "evt_3d4e...",\n  "type": "payout.success",\n  "created_at": "2026-07-08T09:00:00.000Z",\n  "data": {\n    "payout_id": "po_1a2b...",\n    "amount": 1500.0,\n    "currency": "GHS",\n    "destination": "BANK_ACCOUNT",\n    "status": "COMPLETED"\n  }\n}`
                },
                {
                  name: "payout.failed",
                  code: `{\n  "id": "evt_7f8g...",\n  "type": "payout.failed",\n  "created_at": "2026-07-08T09:15:00.000Z",\n  "data": {\n    "payout_id": "po_3c4d...",\n    "amount": 500.0,\n    "currency": "USD",\n    "destination": "MOBILE_MONEY",\n    "status": "FAILED",\n    "failure_reason": "Invalid account number"\n  }\n}`
                }
              ]} 
            />

            <div className="mt-8">
              <SectionLabel type="parameters">Events payload</SectionLabel>
              <div className="overflow-x-auto rounded-xl border border-gray-100 mt-2">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <tr><th className="px-4 py-3">Event</th><th className="px-4 py-3">Fires when</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-600">
                    <tr><td className="px-4 py-3 font-mono">payment.success</td><td className="px-4 py-3">A payment settles (funds credited to your balance).</td></tr>
                    <tr><td className="px-4 py-3 font-mono">payment.failed</td><td className="px-4 py-3">A payment fails or expires. <code>data.failure_reason</code> explains why.</td></tr>
                    <tr><td className="px-4 py-3 font-mono">payout.success</td><td className="px-4 py-3">A settlement to your payout account completes.</td></tr>
                    <tr><td className="px-4 py-3 font-mono">payout.failed</td><td className="px-4 py-3">A settlement is declined; funds return to your balance.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <AlertBox type="info" title="Webhook Delivery Retry">
              Respond with any 2xx quickly (under 10 seconds) — do your processing async. Failed
              deliveries retry with backoff (1m, 5m, 30m, 2h, 8h, 24h) before being marked
              exhausted; you can redeliver manually from the dashboard.
            </AlertBox>

            <SectionTitle id="signatures">Verifying signatures</SectionTitle>
            <p className="text-gray-600 leading-relaxed mb-4">
              Every delivery carries an{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">X-Trite-Signature</code> header:{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">t=&lt;unix&gt;,v1=&lt;hex&gt;</code>.
              Compute HMAC-SHA256 of <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">{"`${t}.${rawBody}`"}</code>{" "}
              with your signing secret (Settings → Integrations), compare timing-safely, and reject
              if the timestamp is more than 5 minutes old.
            </p>
            
            <CodeTabs 
              tabs={[
                {
                  name: "Node.js",
                  code: `import crypto from "crypto";\n\nfunction verifyTriteSignature(rawBody, header, secret) {\n  const { t, v1 } = Object.fromEntries(\n    header.split(",").map((p) => p.split("="))\n  );\n  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;\n  const expected = crypto\n    .createHmac("sha256", secret)\n    .update(\`\${t}.\${rawBody}\`)\n    .digest("hex");\n  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));\n}`
                },
                {
                  name: "Python",
                  code: `import hashlib, hmac, time\n\ndef verify_trite_signature(raw_body: bytes, header: str, secret: str) -> bool:\n    parts = dict(p.split("=", 1) for p in header.split(","))\n    if abs(time.time() - int(parts["t"])) > 300:\n        return False\n    expected = hmac.new(\n        secret.encode(), f"{parts['t']}.".encode() + raw_body, hashlib.sha256\n    ).hexdigest()\n    return hmac.compare_digest(expected, parts["v1"])`
                }
              ]} 
            />

            <SectionTitle id="rate-limits">Rate limits</SectionTitle>
            <p className="text-gray-600 leading-relaxed mb-4">
              Limits are per merchant, per bucket, in a fixed one-minute window. Exceeding one returns{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">429</code> with a{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">Retry-After</code> header
              (seconds). Back off and retry after that interval.
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Bucket</th>
                    <th className="px-4 py-3">Limit</th>
                    <th className="px-4 py-3">Endpoints</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600">
                  <tr><td className="px-4 py-3 font-mono">v1/payments</td><td className="px-4 py-3">60/min</td><td className="px-4 py-3">Create session, check session status</td></tr>
                  <tr><td className="px-4 py-3 font-mono">v1/payments/charge</td><td className="px-4 py-3">60/min</td><td className="px-4 py-3">Direct charge, submit OTP</td></tr>
                  <tr><td className="px-4 py-3 font-mono">v1/payments/charge:status</td><td className="px-4 py-3">300/min</td><td className="px-4 py-3">Read a charge by reference — a polling loop can never starve your charge bucket</td></tr>
                </tbody>
              </table>
            </div>

            <SectionTitle id="deprecations">Deprecations</SectionTitle>
            <AlertBox type="warning" title="Endpoint Deprecation">
              <code className="rounded bg-amber-100 px-1.5 py-0.5 text-sm font-mono text-amber-900">POST /api/payments/initiate</code>{" "}
              is a deprecated alias of{" "}
              <code className="rounded bg-amber-100 px-1.5 py-0.5 text-sm font-mono text-amber-900">POST /api/v1/payments/initiate</code>{" "}
              and now requires the same API-key authentication. Migrate to the v1 path; a removal
              date will be announced in advance.
            </AlertBox>

            <SectionTitle id="sdk">SDKs</SectionTitle>
            <div className="bg-black rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider mb-6">
                  Coming Soon
                </div>
                <h2 className="text-3xl sm:text-4xl font-black mb-6">SDKs & Libraries</h2>
                <p className="text-lg text-white/70 mb-8 leading-relaxed">
                  We&#39;re working on official libraries for Node.js, Python, PHP, and more.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
                <Book className="h-64 w-64 translate-x-1/4 translate-y-1/4" />
              </div>
            </div>
            
          </div>
          
          {/* Right Sidebar (Sticky Navigation) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28">
              <nav className="rounded-2xl bg-gray-50 border border-gray-100 p-6 text-sm">
                <div className="font-bold mb-4 text-black text-base">On this page</div>
                <ul className="space-y-3 text-gray-600 font-medium">
                  <li><a href="#getting-started" className="hover:text-[#22c55e] transition-colors block">Getting started</a></li>
                  <li><a href="#authentication" className="hover:text-[#22c55e] transition-colors block">Authentication</a></li>
                  <li><a href="#merchant-verification" className="hover:text-[#22c55e] transition-colors block">Merchant verification</a></li>
                  <li><a href="#create-session" className="hover:text-[#22c55e] transition-colors block">Create a payment session</a></li>
                  <li><a href="#session-status" className="hover:text-[#22c55e] transition-colors block">Check session status</a></li>
                  <li><a href="#direct-charge" className="hover:text-[#22c55e] transition-colors block">Direct charge</a></li>
                  <li><a href="#webhooks" className="hover:text-[#22c55e] transition-colors block">Webhooks</a></li>
                  <li><a href="#signatures" className="hover:text-[#22c55e] transition-colors block">Verifying signatures</a></li>
                  <li><a href="#rate-limits" className="hover:text-[#22c55e] transition-colors block">Rate limits</a></li>
                  <li><a href="#deprecations" className="hover:text-[#22c55e] transition-colors block">Deprecations</a></li>
                  <li><a href="#sdk" className="hover:text-[#22c55e] transition-colors block">SDKs</a></li>
                </ul>
              </nav>
            </div>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
