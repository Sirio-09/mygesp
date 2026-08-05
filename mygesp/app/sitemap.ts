import { prisma } from "@/lib/db";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.mygesp.it";

  const products = await prisma.product.findMany({
    select: { slug: true, createdAt: true },
  });

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/prodotto/${product.slug}`,
    lastModified: product.createdAt,
  }));

  const staticUrls = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/categoria/abbigliamento`, lastModified: new Date() },
    { url: `${baseUrl}/categoria/stivali`, lastModified: new Date() },
    { url: `${baseUrl}/categoria/attrezzature`, lastModified: new Date() },
  ];

  return [...staticUrls, ...productUrls];
}