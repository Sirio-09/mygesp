import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/metadata";

// La pagina è un server component ma senza metadata: li dichiara qui.
export const metadata: Metadata = privatePageMetadata("Modifica prodotto");

export default function ProdottoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
