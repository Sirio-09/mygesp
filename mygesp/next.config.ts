import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rimosso output: 'export' per consentire il funzionamento di API e Prisma

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
