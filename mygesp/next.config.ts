import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Non esporre la tecnologia usata (fingerprinting gratuito per gli attaccanti).
  poweredByHeader: false,
  // I lockfile del repository sono due (root del workspace e progetto): senza
  // questa riga Turbopack infersce come root la cartella superiore e il file
  // tracing include file estranei al progetto.
  turbopack: {
    root: process.cwd(),
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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            // Forza HTTPS per due anni (i browser ignorano l'header in HTTP
            // locale, quindi non interferisce con `next dev`).
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
