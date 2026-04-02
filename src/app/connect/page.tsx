"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WalletConnectPage() {
  const router = useRouter();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [walletAddress, setWalletAddress] = useState("");

  const wallets = [
    {
      id: "metamask",
      name: "MetaMask",
      description: "Connect via browser extension",
      icon: MetaMaskIcon,
      color: "bg-orange-50 text-orange-700",
      popular: true,
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      description: "Scan QR code with your mobile wallet",
      icon: WalletConnectIcon,
      color: "bg-blue-50 text-blue-700",
      popular: true,
    },
  ];

  const handleWalletSelect = (walletId: string) => {
    setSelectedWallet(walletId);
    setConnectionStatus("connecting");
    
    // Simulate connection process
    setTimeout(() => {
      // 80% success rate for demo
      const success = Math.random() > 0.2;
      if (success) {
        setConnectionStatus("connected");
        setWalletAddress("0x" + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(""));
      } else {
        setConnectionStatus("error");
      }
    }, 2000);
  };

  const handleDisconnect = () => {
    setSelectedWallet(null);
    setConnectionStatus("idle");
    setWalletAddress("");
  };

  const selectedWalletData = wallets.find(w => w.id === selectedWallet);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f6f7fb] to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/tritee-logo.png"
              alt="Trite logo"
              width={120}
              height={28}
              priority
            />
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-[color:var(--trite-muted)] hover:text-[color:var(--trite-ink)]"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        {connectionStatus === "idle" && (
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[color:var(--trite-lime)]">
              <WalletIcon className="h-8 w-8 text-[color:var(--trite-ink)]" />
            </div>
            <h1 className="mt-6 text-2xl font-semibold text-[color:var(--trite-ink)]">
              Connect Your Wallet
            </h1>
            <p className="mt-2 text-sm text-[color:var(--trite-muted)]">
              Choose a wallet to connect to Trite for secure payments
            </p>
          </div>
        )}

        {connectionStatus === "connecting" && selectedWalletData && (
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5 text-center">
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${selectedWalletData.color.split(" ")[0]}`}>
              <selectedWalletData.icon className={`h-8 w-8 ${selectedWalletData.color.split(" ")[1]}`} />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-[color:var(--trite-ink)]">
              Connecting to {selectedWalletData.name}
            </h2>
            <p className="mt-2 text-sm text-[color:var(--trite-muted)]">
              Please approve the connection in your wallet...
            </p>
            <div className="mt-6">
              <div className="h-2 w-full rounded-full bg-black/10 overflow-hidden">
                <div className="h-full w-1/3 rounded-full bg-[color:var(--trite-lime-strong)] animate-pulse" />
              </div>
            </div>
            <button
              onClick={() => setConnectionStatus("idle")}
              className="mt-6 text-sm text-[color:var(--trite-muted)] hover:text-[color:var(--trite-ink)]"
            >
              Cancel
            </button>
          </div>
        )}

        {connectionStatus === "connected" && (
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-[color:var(--trite-ink)]">
              Wallet Connected!
            </h2>
            <p className="mt-2 text-sm text-[color:var(--trite-muted)]">
              Your wallet is now connected to Trite
            </p>
            
            <div className="mt-6 rounded-xl bg-black/[0.02] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--trite-lime)]">
                  <WalletIcon className="h-5 w-5 text-[color:var(--trite-ink)]" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-[color:var(--trite-muted)]">Connected Wallet</p>
                  <p className="font-mono text-sm font-medium text-[color:var(--trite-ink)]">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleDisconnect}
                className="flex-1 rounded-xl border border-black/10 py-3 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/5"
              >
                Disconnect
              </button>
              <Link
                href="/pay"
                className="flex-1 rounded-xl bg-[color:var(--trite-ink)] py-3 text-sm font-semibold text-white hover:bg-black text-center"
              >
                Make Payment
              </Link>
            </div>
          </div>
        )}

        {connectionStatus === "error" && (
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XIcon className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-[color:var(--trite-ink)]">
              Connection Failed
            </h2>
            <p className="mt-2 text-sm text-[color:var(--trite-muted)]">
              Could not connect to wallet. Please try again.
            </p>
            <button
              onClick={() => setConnectionStatus("idle")}
              className="mt-6 w-full rounded-xl bg-[color:var(--trite-ink)] py-3 text-sm font-semibold text-white hover:bg-black"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Wallet Selection Grid */}
        {connectionStatus === "idle" && (
          <div className="mt-8 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--trite-muted)]">
              Popular
            </p>
            
            {wallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleWalletSelect(wallet.id)}
                className="flex w-full items-center gap-4 rounded-xl border border-black/10 bg-white p-4 transition-all hover:border-[color:var(--trite-lime-strong)] hover:shadow-sm"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${wallet.color}`}>
                  <wallet.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 text-left">
                  <span className="block font-semibold text-[color:var(--trite-ink)]">{wallet.name}</span>
                  <span className="text-sm text-[color:var(--trite-muted)]">{wallet.description}</span>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-[color:var(--trite-muted)]" />
              </button>
            ))}
          </div>
        )}

        {/* Info Box */}
        {connectionStatus === "idle" && (
          <div className="mt-8 rounded-xl bg-[color:var(--trite-lime)]/20 p-4">
            <div className="flex items-start gap-3">
              <InfoIcon className="h-5 w-5 text-[color:var(--trite-ink)] mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[color:var(--trite-ink)]">
                  Why connect a wallet?
                </p>
                <p className="mt-1 text-xs text-[color:var(--trite-muted)]">
                  Connecting your wallet enables secure USDC and USDT payments directly from your crypto holdings. 
                  Your private keys stay in your wallet—we never have access to your funds.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Trust Badges */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-[color:var(--trite-muted)]">
          <div className="flex items-center gap-1">
            <ShieldCheckIcon className="h-4 w-4" />
            <span>Non-custodial</span>
          </div>
          <div className="flex items-center gap-1">
            <LockIcon className="h-4 w-4" />
            <span>Secure</span>
          </div>
        </div>
      </main>
    </div>
  );
}

// Icons
function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
      <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
      <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
    </svg>
  );
}

function MetaMaskIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function WalletConnectIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.91 7.52c4.1-4.03 10.88-4.03 15.18 0l.5.5c.2.2.51.2.71 0l.5-.5c.4-.4.4-1.04 0-1.44-4.7-4.62-12.21-4.62-16.9 0-.4.4-.4 1.04 0 1.44l.5.5c.2.2.51.2.71 0l.5-.5z" />
      <path d="M4.24 11.12c.2.2.51.2.71 0l.5-.5c3.6-3.54 9.55-3.54 13.1 0l.5.5c.2.2.51.2.71 0l.5-.5c.4-.4.4-1.04 0-1.44-4.3-4.23-11.23-4.23-15.52 0-.4.4-.4 1.04 0 1.44l.5.5z" />
      <path d="M7.47 14.36c.2.2.51.2.71 0l.5-.5c2.1-2.06 5.56-2.06 7.64 0l.5.5c.2.2.51.2.71 0l.5-.5c.4-.4.4-1.04 0-1.44-2.8-2.75-7.24-2.75-10.04 0-.4.4-.4 1.04 0 1.44l.5.5z" />
      <path d="M10.71 17.6c.2.2.51.2.71 0l.5-.5c.6-.6 1.59-.6 2.18 0l.5.5c.2.2.51.2.71 0l.5-.5c.4-.4.4-1.04 0-1.44-1.3-1.28-3.4-1.28-4.7 0-.4.4-.4 1.04 0 1.44l.5.5z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
