import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

/**
 * Root metadata for SEO — applied to all pages unless overridden.
 */
export const metadata: Metadata = {
  metadataBase: new URL("http://148.230.66.71:3003"),
  title: {
    default: "Launch IQ — AI CTO for Every Idea",
    template: "%s | Launch IQ",
  },
  description:
    "From Thought to Production — 12-Stage Autonomous AI Pipeline. 50+ AI tools, multi-agent orchestration, and Bhagavad Gita inspired development workflow. Built by Algo IQ Group.",
  keywords: [
    "AI software factory",
    "autonomous development",
    "AI pipeline",
    "code generation",
    "Bhagavad Gita",
    "Algo IQ",
    "AI agents",
    "software engineering",
    "Next.js",
    "DeepSeek",
  ],
  authors: [{ name: "Algo IQ Software Solutions Pvt Ltd" }],
  creator: "Algo IQ Group",
  publisher: "Algo IQ Software Solutions Pvt Ltd",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "http://148.230.66.71:3003",
    siteName: "Launch IQ",
    title: "Launch IQ — AI CTO for Every Idea",
    description:
      "12-Stage AI Pipeline with 50+ tools. From project idea to production deployment, fully autonomous.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Launch IQ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Launch IQ",
    description: "Autonomous AI Software Development Platform — 50+ AI Tools",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

/**
 * Root layout — minimal shell. Provides fonts and base HTML structure.
 * The (app) and (public) route groups handle their own layouts.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0b0e14] text-white`}>
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-[#a855f7] focus:text-white font-bold"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
