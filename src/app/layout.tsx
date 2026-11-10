import type { Metadata } from "next";
import "./globals.css";
import { FishProvider } from "@/components/ui/Fish";

const SITE_DESC = "一罐花胶，满满胶傲 · Fresh fish maw slow-stewed with real ingredients and milk. Pandan, Noir, Calm and Rose. No preservatives, made fresh in Singapore.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://joyjar-shop.vercel.app"),
  title: "小胶傲 JoyJar · Fresh fish maw in a jar",
  description: SITE_DESC,
  openGraph: {
    type: "website",
    siteName: "小胶傲 JoyJar",
    title: "小胶傲 JoyJar · Joy to the World!",
    description: SITE_DESC,
    url: "/",
    locale: "en_SG",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "小胶傲 JoyJar · Joy to the World!" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "小胶傲 JoyJar · Joy to the World!",
    description: SITE_DESC,
    images: ["/og-image.jpg"],
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
      data-theme="classic"
      data-display="serif"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=Hanken+Grotesk:wght@400;500;600;700&family=Noto+Serif+SC:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/svg+xml" href="/assets/joyjar-mark.svg" />
        <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
      </head>
      <body>
        <FishProvider />
        {children}
      </body>
    </html>
  );
}
