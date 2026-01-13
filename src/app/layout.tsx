import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Abu Hommos Marketplace - Local Clothing Shops",
  description: "Discover local clothing shops in Abu Hommos, Egypt. Support local brands and find the best fashion near you.",
  keywords: ["Abu Hommos", "marketplace", "clothing", "fashion", "local shops", "Egypt"],
  authors: [{ name: "Abu Hommos Marketplace" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Abu Hommos Marketplace",
    description: "Discover local clothing shops in Abu Hommos, Egypt",
    url: "https://abuhommos-marketplace.com",
    siteName: "Abu Hommos Marketplace",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Abu Hommos Marketplace",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
