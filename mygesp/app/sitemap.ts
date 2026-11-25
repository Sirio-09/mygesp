import { prisma } from "@/lib/db";
import { getBaseUrl } from "@/lib/baseUrl";
import type { MetadataRoute } from "next";

// Senza revalidate la sitemap viene generata una sola volta al build: i
// prodotti pubblicati dopo il deploy non comparirebbero fino al rebuild.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  const products = await prisma.product.findMany({
    select: { slug: true, createdAt: true },
  });

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/prodotto/${product.slug}`,
    lastModified: product.createdAt,
  }));

  const staticUrls = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/prodotti`, lastModified: new Date() },
    { url: `${baseUrl}/categoria/abbigliamento`, lastModified: new Date() },
    { url: `${baseUrl}/categoria/stivali`, lastModified: new Date() },
    { url: `${baseUrl}/categoria/attrezzature`, lastModified: new Date() },
  ];

  return [...staticUrls, ...productUrls];
}