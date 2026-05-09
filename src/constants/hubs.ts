export interface Hub {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  amount: string;
  method: string;
  status: string;
  description: string;
  fact?: string;
}

export const HUBS: Hub[] = [
  {
    id: "accra",
    name: "Accra, Ghana",
    latitude: 5.6037,
    longitude: -0.187,
    amount: "GHS 52,400.00",
    method: "MTN Mobile Money",
    status: "Settled",
    description: "Regional distribution payout completed in seconds.",
    fact: "Local Mobile Money (MTN) integrations allow for near-instant distribution of funds to rural and urban agents across Ghana.",
  },
  {
    id: "london",
    name: "London, UK",
    latitude: 51.5074,
    longitude: -0.1278,
    amount: "£12,500.00",
    method: "USDT Stablecoin",
    status: "Success",
    description: "Cross-border B2B settlement via digital asset rails.",
    fact: "Institutional stablecoin rails bridge the 3000-mile gap from West Africa to the City of London, bypassing traditional 3-day clearing cycles.",
  },
  {
    id: "lagos",
    name: "Lagos, Nigeria",
    latitude: 6.5244,
    longitude: 3.3792,
    amount: "NGN 4,200,000.00",
    method: "Bank Transfer",
    status: "Processing",
    description: "High-volume merchant liquidity replenishment.",
    fact: "High-velocity bank transfers in Lagos are secured by multi-layer encryption, ensuring high-volume merchants stay liquid 24/7.",
  },
  {
    id: "new-york",
    name: "New York, USA",
    latitude: 40.7128,
    longitude: -74.006,
    amount: "$25,000.00",
    method: "USDC",
    status: "Settled",
    description: "Institutional treasury movement across borders.",
    fact: "Cross-Atlantic treasury movements settle in under 2 seconds, providing US-based enterprises with instant access to emerging market revenue.",
  },
  {
    id: "singapore",
    name: "Singapore",
    latitude: 1.3521,
    longitude: 103.8198,
    amount: "SGD 15,000.00",
    method: "Digital Wallet",
    status: "Settled",
    description: "Real-time retail gateway clearance.",
    fact: "Connecting the Asian-African corridor, our unified API routes transactions through digital wallets for 99.9% success rates.",
  },
  {
    id: "dubai",
    name: "Dubai, UAE",
    latitude: 25.2048,
    longitude: 55.2708,
    amount: "AED 45,000.00",
    method: "USDT",
    status: "Success",
    description: "Luxury goods merchant settlement via stablecoin.",
    fact: "Dubai's digital asset economy thrives on seamless USDT settlements, connecting luxury merchants with global liquidity in real-time.",
  },
];
