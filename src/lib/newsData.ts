export interface Article {
  id: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  overlayText?: string;
  content: string[];
}

export const pressReleases: Article[] = [
  {
    id: "hybrid-banking-networks",
    title: "Trite Collaborates with Leading Banking Partners to Pioneer Hybrid Digital Asset Settlement Networks",
    date: "July 6, 2026",
    readTime: "4-minute read",
    category: "Press Releases",
    description: "Establishing secure gateways linking traditional clearing networks with digital liquidity nodes, allowing treasury managers to transition between fiat and stablecoins seamlessly.",
    image: "/images/bank-partners.jpg",
    content: [
      "Trite is pleased to announce a strategic collaboration with regional clearing banks to establish a hybrid payment network. This collaboration creates a secure settlement bridge connecting traditional commercial bank ledgers with digital asset liquidity networks.",
      "Through this hybrid network, corporate treasury managers can transition between local fiat currencies and stablecoins seamlessly. When a merchant requests a payout, the settlement engine routes the transaction through the optimal channel—whether that is a local real-time gross settlement (RTGS) bank network or a digital asset ledger.",
      "This architecture mitigates liquidity risk and reduces reliance on volatile foreign exchange markets. Treasury teams can automate their cash sweeps, setting parameters to convert stablecoins into bank deposits dynamically based on real-time market rates and business settlement schedules.",
      "The hybrid system has already gone live with selected institutional merchants during a beta phase, showing a 60% reduction in settlement costs and an average processing time of under ten minutes. A general rollout is scheduled to commence next month, providing all Trite business accounts with access to the hybrid network."
    ]
  },
  {
    id: "compliance-integration-sumsub",
    title: "Trite Integrates Sumsub & Appruve to Elevate Real-Time KYC/AML Compliance Standards",
    date: "June 28, 2026",
    readTime: "3-minute read",
    category: "Compliance",
    description: "Enabling automated merchant verification, identity validation, and transaction monitoring to prevent fraudulent operations and ensure compliance with regional central bank regulations.",
    image: "/images/kyc_3d.png",
    content: [
      "Trite has successfully integrated Sumsub and Appruve into its onboarding and transaction routing systems. This integration enables automated, bank-grade merchant verification, identity validation, and real-time KYC/AML compliance checks for all accounts.",
      "As digital transactions scale across the continent, compliance has become a primary bottleneck for merchants. Traditional onboarding processes can take several weeks, delaying business operations. By partnering with Sumsub and Appruve, Trite automates identity checks against national databases, reducing verification times to under ten minutes.",
      "Beyond onboarding, the integration adds real-time transaction monitoring to detect anomalies and satisfy regional anti-money laundering (AML) guidelines. The system dynamically monitors transaction velocities, wallet addresses, and settlement frequencies to flag suspicious behavior before funds are moved.",
      "This robust compliance infrastructure reinforces Trite's commitment to security. By embedding compliance directly into our payment rails, we protect our merchants from fraud while offering institutional partners a fully transparent payment corridor."
    ]
  },
  {
    id: "routing-engine-api-v2",
    title: "Introducing Trite API v2.0: High-Performance Merchant Payment Routing Engine",
    date: "May 22, 2026",
    readTime: "5-minute read",
    category: "Developer Updates",
    description: "Upgraded developer infrastructure featuring lower latencies, improved webhooks reliability, and multi-threaded transaction processing support.",
    image: "/images/merchant-payment.jpg",
    content: [
      "We are excited to launch Trite API v2.0, a complete upgrade to our developer infrastructure. The new version features up to 40% lower response latencies, multi-threaded transaction processing, and a more robust webhook delivery engine.",
      "Our developers require payment tools that can scale alongside their applications. API v2.0 introduces simplified endpoints, making it easier to initiate stablecoin-to-fiat settlements, query transaction ledgers, and manage client verification tiers programmatically.",
      "The webhook infrastructure has been rebuilt from scratch to guarantee message delivery, utilizing an automated exponential backoff retry mechanism. Developers can now track transaction state changes with high-resolution log telemetry, simplifying debugging and accounting integrations.",
      "The API v2.0 developer portal is now live with comprehensive SDK support for Node.js, Go, Python, and React. Detailed documentation, code playgrounds, and sandboxed testing credentials are available in the developer settings."
    ]
  },
  {
    id: "liquidity-pool-swaps",
    title: "Trite Launches Automated Liquidity Pool Swaps for Enterprise Cross-Border Payments",
    date: "April 02, 2026",
    readTime: "3-minute read",
    category: "Core Updates",
    description: "Integrating automated market-making algorithms to optimize currency swaps between USDT, USDC, and local African currencies.",
    image: "/images/cross-border.jpg",
    content: [
      "Trite has deployed automated liquidity pool swaps across its settlement nodes. This feature integrates automated market-making (AMM) algorithms to optimize currency swaps between USDT, USDC, and local currencies.",
      "Cross-border payments are often delayed due to a lack of immediate foreign currency availability. Trite's liquidity pools act as localized reserves, allowing the system to execute transactions without waiting for bank-level currency allocations.",
      "The swap engine constantly monitors exchange rates across multiple exchanges and local networks, routing transactions through the most cost-effective path. This ensures that merchants receive their payouts with minimal conversion slippage.",
      "The automated swap system is fully integrated into the transaction lifecycle and runs in the background. Merchants will benefit from lower transaction costs and faster processing times immediately."
    ]
  },
  {
    id: "custody-rails-transparency",
    title: "Trite Partners with Global Audit Firm to Ensure Transparency of Institutional Custody Rails",
    date: "March 15, 2026",
    readTime: "5-minute read",
    category: "Compliance",
    description: "Engaging top-tier accounting partners to run real-time audits of custodial accounts, guaranteeing 100% stablecoin asset backing.",
    image: "/images/businessman-working-laptop.jpg",
    content: [
      "Trite has partnered with a leading global audit firm to provide real-time transparency into our institutional custody accounts. This partnership ensures that all stablecoin assets managed on our platform are fully audited and verified.",
      "In the digital asset industry, transparency is the cornerstone of institutional trust. By auditing custodial reserves, Trite guarantees that every digital dollar processed on our network is fully backed by real-world assets in audited banking institutions.",
      "The new audit framework utilizes automated API integrations to pull balance reports and publish them on our transparency portal weekly. Merchants and banking partners can inspect these reports at any time, confirming that assets match customer liabilities.",
      "This auditing system represents a major milestone in our commitment to institutional oversight. We believe that open, transparent ledgers are key to bridging traditional banking with digital assets, setting a new benchmark for fintech platforms."
    ]
  }
];

export const ourStories: Article[] = [
  {
    id: "stablecoin-settlement-rails",
    title: "Trite Launches Real-Time Stablecoin Settlement Rails across African Corridors",
    date: "July 10, 2026",
    readTime: "5-minute read",
    category: "Core Updates",
    description: "Deploying institutional liquidity pools to enable instantaneous trade settlement, eliminating traditional multi-day SWIFT cycles for enterprise merchants across the continent.",
    image: "/images/two-african-businessman.jpg",
    content: [
      "Trite has officially rolled out its real-time stablecoin settlement rails across major trade corridors in West and East Africa. This deployment marks a major shift in cross-border commerce, allowing enterprise merchants to settle transactions in minutes rather than waiting the typical 3-5 business days associated with SWIFT and traditional banking correspondence.",
      "By integrating stablecoins like USDT and USDC directly with local payment networks, Trite bypasses the friction points of multiple intermediary clearing banks. The new service leverages deep localized liquidity pools, enabling automated conversions with near-zero slippage. Corporate treasuries can now manage cash flows dynamically and eliminate currency volatility risk in real-time.",
      "Our engineering team has worked closely with regional liquidity providers to ensure that transaction queues are cleared programmatically. Transactions are backed by end-to-end telemetry, allowing compliance officers to track and audit the flow of funds from digital wallets straight through to local fiat currency bank accounts.",
      "With initial corridors established between Nigeria, Ghana, Kenya, and South Africa, Trite plans to expand this high-velocity architecture to another six markets in French-speaking West Africa by the end of the year. This rollout represents a critical component of our mission to build a frictionless payment architecture tailored to the modern African enterprise."
    ]
  },
  {
    id: "engineering-ledger-databases",
    title: "Inside Trite's High-Velocity Infrastructure: Engineering Sub-Second Settlement Ledger Systems",
    date: "July 2, 2026",
    readTime: "6-minute read",
    category: "Engineering",
    description: "An in-depth look at our technical architecture, highlighting how we maintain database integrity, concurrency, and real-time telemetry under peak platform volume.",
    image: "/images/saas.jpg",
    content: [
      "At the core of the Trite Payment Service Provider is our ledger database, built to handle high-concurrency payment volumes with sub-second finality. This system ensures that all transactions are recorded in a secure, tamper-proof audit trail.",
      "Traditional ledgers often suffer from write lock issues under heavy load, causing transaction timeouts and settlement delays. Trite resolves this bottleneck by implementing a specialized distributed database architecture that logs transactions asynchronously while maintaining strict consistency.",
      "Our system utilizes an event-driven model backed by high-throughput message brokers. This allows the system to process incoming payment notifications, trigger KYC/AML validation rules, and coordinate stablecoin conversions in parallel without blocking database operations.",
      "Furthermore, the ledger features real-time telemetry, monitoring transaction velocity, database replication lags, and API response metrics. This high-resolution monitoring allows our infrastructure engineering team to detect and resolve potential issues before they impact merchant operations."
    ]
  },
  {
    id: "market-women-micro-payments",
    title: "Empowering Local Market Women and Micro-Merchants via Stablecoin Micro-Payment Terminals",
    date: "June 30, 2026",
    readTime: "4-minute read",
    category: "Impact",
    description: "Deploying low-cost payment terminals and QR interfaces to enable local traders in Accra to accept stablecoin micropayments without high card fees.",
    image: "/images/market-women.jpg",
    content: [
      "Trite has launched a pilot project in Accra to bring digital asset payments to local market women and micro-retailers. By deploying low-cost QR terminals, the project enables traders to accept stablecoin micro-payments directly from mobile wallets.",
      "For small traders, accepting digital payments is often prohibitively expensive due to high transaction fees and hardware costs. Trite's QR terminals bypass these card fees, allowing traders to settle sales in stablecoins for a fraction of a cent per transaction.",
      "The system is designed for ease of use, featuring an audio-assisted terminal that confirms successful payments in local languages. This ensures that traders can verify transactions instantly during busy market hours without needing to check a screen.",
      "The pilot has already onboarded over two hundred traders, showing a significant increase in sales volumes as consumers adopt mobile-first stablecoin payments. We plan to expand this micro-payment project to other regional markets later this year."
    ]
  },
  {
    id: "cornell-university-delegation",
    title: "Cornell University Delegation Visits Trite to Understand the African Digital Currency Economy",
    date: "May 18, 2026",
    readTime: "5-minute read",
    category: "Education",
    description: "Studying the intersection of traditional clearing networks, mobile money, and stablecoins in emerging fintech markets.",
    overlayText: "Academic Collaboration",
    image: "/images/digital-markets.jpg",
    content: [
      "A delegation of researchers and students from Cornell University recently visited Trite's offices. The visit focused on studying how digital currencies and stablecoins are transforming business settlements and remittances in Africa.",
      "The delegation participated in workshops with our engineering, compliance, and product teams, examining our ledger systems and localized payout gateways. The workshops highlighted how Trite bridges digital asset networks with traditional banking corridors.",
      "We were excited to host the Cornell delegation and share our insights on the digital currency economy. Academic collaboration is key to developing research and understanding the economic impact of fintech innovations in emerging markets.",
      "The visit concluded with a discussion on future research partnerships, focusing on tracking transaction velocities and measuring the efficiency of stablecoin settlements compared to traditional bank corridors."
    ]
  },
  {
    id: "future-remittance-markets",
    title: "The Future of Frictionless Cross-Border Remittances in Emerging Markets",
    date: "April 30, 2026",
    readTime: "4-minute read",
    category: "Insights",
    description: "Analyzing the role of stablecoins in reducing remittance fees and providing faster payout channels for cross-border corridors.",
    image: "/images/digital-service.jpg",
    content: [
      "Cross-border remittances are a critical economic lifeline for millions of families in emerging markets. However, the market remains constrained by high fees, complex exchange rates, and slow processing times.",
      "Stablecoins offer a compelling solution to these issues, enabling instant settlements at a fraction of the cost of traditional money transfer systems. By using digital asset networks, remittance providers can bypass clearing intermediaries and route payments directly.",
      "This analysis examines the growth of stablecoin remittance corridors and their impact on transaction speeds. We outline how Trite's payout APIs enable remittance platforms to settle transactions instantly through local Mobile Money networks.",
      "As regulatory frameworks adapt to support digital assets, we expect stablecoin-driven remittances to see massive growth, lowering costs and providing faster payout options for consumers in emerging markets."
    ]
  },
  {
    id: "retailer-conversion-rates",
    title: "How Direct Mobile Money Integrations are Boosting Conversion Rates for Local Retailers",
    date: "April 12, 2026",
    readTime: "3-minute read",
    category: "Insights",
    description: "Evaluating the impact of localized Mobile Money API integrations on checkout flow drop-offs and retailer revenue optimization.",
    image: "/images/man-momoo.png",
    content: [
      "For retail merchants in mobile-first markets, checkout friction is a primary cause of transaction drop-offs. Traditional card payment flows often require multiple verification steps, resulting in cart abandonment.",
      "Direct Mobile Money integrations simplify checkout, allowing consumers to confirm payments with a single prompt on their mobile device. This ease of use significantly increases transaction success rates and retailer revenue.",
      "Trite's checkout gateway integrates directly with regional mobile money providers, optimizing the payment flow for speed and reliability. Our research shows that merchants switching to our integrated gateway saw an average 18% increase in conversion rates.",
      "By eliminating friction and offering consumers their preferred payment channels, retailers can optimize their checkouts and grow their businesses in mobile-first markets."
    ]
  },
  {
    id: "compliance-digital-assets",
    title: "Redefining Security: Why Bank-Grade Compliance is Non-Negotiable for Digital Asset Providers",
    date: "March 20, 2026",
    readTime: "4-minute read",
    category: "Insights",
    description: "Exploring the compliance architectures needed to secure digital assets, audit transactions, and prevent financial fraud.",
    image: "/images/chief-financial-officer.jpg",
    content: [
      "In the digital asset industry, security and compliance are the foundations of merchant trust. As institutional adoption grows, platforms must build robust frameworks to secure assets and monitor transactions.",
      "Bank-grade compliance requires a multi-layered approach, combining identity verification (KYC), transaction monitoring (AML), and rigorous database security standards. These measures prevent fraud and ensure operations align with central bank regulations.",
      "This article outlines the compliance architecture developed at Trite. We discuss how we integrate automated verification databases, run continuous security audits, and implement hardware security modules to protect data and assets.",
      "We believe that maintaining high compliance standards is non-negotiable for digital asset providers, safeguarding merchants and establishing a secure ecosystem for modern enterprise payments."
    ]
  },
  {
    id: "ceo-fintech-award",
    title: "Celebrating Leadership: Trite CEO Awarded Young FinTech Innovator of the Year",
    date: "February 28, 2026",
    readTime: "2-minute read",
    category: "Community",
    description: "Recognized for leading Trite's growth, developing stablecoin corridors, and expanding financial access across the African region.",
    image: "/images/two-african-businessman.jpg",
    content: [
      "Trite's Chief Executive Officer has been awarded the Young FinTech Innovator of the Year. The award recognizes outstanding leadership, product innovation, and impact in the regional fintech sector.",
      "Under our CEO's leadership, Trite has grown from a seed-stage project to a licensed cross-border payment provider, processing transactions for hundreds of enterprise merchants and linking mobile networks with stablecoins.",
      "We congratuate our CEO on this recognition. This award highlights the team's commitment to building payment systems that address the actual cash flow challenges faced by African businesses.",
      "Trite remains focused on expanding our team, developing new features, and building the infrastructure needed to support trade and financial integration across emerging markets."
    ]
  }
];

export const allArticles: Article[] = [
  ...pressReleases,
  ...ourStories
];

// Dynamically get the latest 4 articles by date for the carousel
export const featuredStories: Article[] = [...allArticles]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 4);

// Inside Trite — product launches, engineering deep-dives, employee stories, and company culture
export const insideTrite: Article[] = ourStories.filter((s) =>
  ["Engineering", "Impact", "Community", "Core Updates", "Education"].includes(s.category)
);
