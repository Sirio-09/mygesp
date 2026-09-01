import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/layout/Providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

// Fallback ultra-sicuro con try/catch per impedire qualsiasi crash di new URL()
const getSafeMetadataBase = (): URL => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (envUrl) {
    try {
      const formatted = envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
      return new URL(formatted);
    } catch {
      // Se l'URL nel DB/Env è malformato, evita il crash della build
    }
  }

  return new URL("http://localhost:3000");
};

export const metadata: Metadata = {
  metadataBase: getSafeMetadataBase(),
  title: "MyGesp — Abbigliamento tecnico e stivali per agricoltura e allevamento",
  description:
    "Abbigliamento impermeabile, stivali termici e attrezzature professionali testati in stalla, al pascolo, nel fango.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${inter.variable} antialiased font-sans`}>
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}