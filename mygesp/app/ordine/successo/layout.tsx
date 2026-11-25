import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/metadata";

// Pagina di conferma: raggiungibile solo dopo un pagamento.
export const metadata: Metadata = privatePageMetadata("Ordine confermato");

export default function OrdineSuccessoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
