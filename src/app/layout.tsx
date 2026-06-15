import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import LoadingOverlay from "@/components/LoadingOverlay";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Trite",
  description: "Financial architecture for the modern enterprise.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-white text-[color:var(--trite-ink)] font-montserrat">
        <LoadingOverlay />
        {children}
      </body>
    </html>
  );
}
