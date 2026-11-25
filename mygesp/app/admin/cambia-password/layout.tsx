import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/metadata";

// La pagina è un client component: titolo e noindex arrivano dal layout.
export const metadata: Metadata = privatePageMetadata("Cambia password");

export default function CambiaPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
