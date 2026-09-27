import type { Metadata, Viewport } from "next";
import "@fontsource-variable/outfit";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { themeInitScript } from "@/components/theme-toggle";
import { MotionRoot } from "@/components/motion/motion-root";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name}: ${siteConfig.tagline}`, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name}: ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f3e9" },
    { media: "(prefers-color-scheme: dark)", color: "#10101c" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent">
          Skip to content
        </a>
        <ToastProvider>{children}</ToastProvider>
        <MotionRoot />
      </body>
    </html>
  );
}
