import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/baseUrl";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Aree private e flussi di pagamento: nessun motivo per indicizzarli.
      disallow: [
        "/admin",
        "/account",
        "/api",
        "/carrello",
        "/checkout",
        "/ordine",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}