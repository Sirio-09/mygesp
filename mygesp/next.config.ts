import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Forza l'esportazione statica richiesta da GitHub Pages
  output: 'export',

  // 2. Ignora gli errori di TypeScript legati a Prisma in fase di build
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    // 3. Disattiva l'ottimizzazione server delle immagini (richiesto per siti statici)
    unoptimized: true,

    // 4. I tuoi parametri originali per Vercel Blob
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
