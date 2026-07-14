import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { ThemeProvider } from "@/components/ui/theme-provider";
import LoadingOverlay from "@/components/LoadingOverlay";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Trite",
  description: "Financial Services Company",
  openGraph: {
    type: "website",
    siteName: "Trite",
    title: "Trite",
    description: "Financial Services Company",
    images: [{ url: "/trite-fav.png", width: 512, height: 512, alt: "Trite" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trite",
    description: "Financial Services Company",
    images: ["/trite-fav.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} h-full antialiased light`}
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-black text-[color:var(--trite-ink)] font-montserrat">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <LoadingOverlay />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
