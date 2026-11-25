import type { Metadata } from "next";
import { inter } from "./fonts";
import "./globals.css";
import Providers from "@/components/layout/Providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";
import SiteChrome from "@/components/layout/SiteChrome";
import { Toaster } from "sonner";

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

const metadataBase = getSafeMetadataBase();

/** URL del sito senza slash finale, usato nei dati strutturati. */
const siteUrl = metadataBase.toString().replace(/\/$/, "");

/**
 * Dati strutturati globali: Organization (brand) e WebSite con SearchAction.
 * I nodi del PDP referenziano `/#organization` tramite `@id`, quindi l'URL
 * canonico del sito deve essere lo stesso in entrambi i punti.
 */
const globalJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "MyGesp",
      url: siteUrl,
      description:
        "Abbigliamento impermeabile, stivali termici e attrezzature professionali per agricoltura e allevamento.",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "MyGesp",
      inLanguage: "it-IT",
      publisher: { "@id": `${siteUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/prodotti?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

// JSON.stringify può produrre la sequenza "</script>": escape dei "<".
const globalJsonLdString = JSON.stringify(globalJsonLd).replace(/</g, "\\u003c");

export const metadata: Metadata = {
  metadataBase,
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
        {/* DATI STRUTTURATI: Organization + WebSite (con ricerca interna) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: globalJsonLdString }}
        />
        <Providers>
          <SiteChrome
            navbar={<Navbar />}
            footer={<Footer />}
            cart={<CartDrawer />}
          >
            {children}
          </SiteChrome>
        </Providers>

        {/* Sistema di notifiche Toast Minimale */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              color: "#22281F",
              border: "1px solid #E2E0D5",
              borderRadius: "0px",
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: "11px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              boxShadow: "0 18px 40px -24px rgba(34, 40, 31, 0.45)",
            },
          }}
        />
      </body>
    </html>
  );
}