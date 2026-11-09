import type { Metadata } from "next";
import "./globals.css";
import { FishProvider } from "@/components/ui/Fish";

export const metadata: Metadata = {
  title: "小胶傲 · JoyJar — Fish Maw Dessert in a Jar",
  description: "Handmade fish maw collagen desserts.",
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
