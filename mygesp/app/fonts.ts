import localFont from "next/font/local";

/**
 * Inter self-hostata (subset latino, font variabile 300–800).
 *
 * Prima si usava `next/font/google`: Next scaricava i woff2 da
 * fonts.gstatic.com *durante la build*. Se la rete della CI non raggiunge
 * Google (o Google è momentaneamente irraggiungibile) la build fallisce con
 * `module-not-found` sui CSS interni del font — è esattamente l'errore visto su
 * Vercel. Tenendo il file nel repository la build è deterministica e offline.
 *
 * Il nome della variabile resta `--font-sans`, lo stesso usato prima: nessuna
 * modifica necessaria in `globals.css` o nelle classi Tailwind.
 */
export const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  weight: "300 800",
  style: "normal",
  display: "swap",
  variable: "--font-sans",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
  preload: true,
});