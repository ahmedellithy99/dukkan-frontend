import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Dukkan - Local Marketplace",
  description: "Discover local clothing shops in Abu Hommos, Egypt. Support local brands and find the best fashion near you.",
  keywords: ["Abu Hommos", "Dukkan", "marketplace", "clothing", "fashion", "local shops", "Egypt"],
  authors: [{ name: "Dukkan" }],
  icons: {
    icon: "/dukkan-logo.svg",
  },
  openGraph: {
    title: "Dukkan - Local Marketplace",
    description: "Discover local clothing shops in Abu Hommos, Egypt",
    url: "https://abuhommos-marketplace.com",
    siteName: "Dukkan",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dukkan - Local Marketplace",
    description: "Discover local clothing shops in Abu Hommos, Egypt",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
