import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/metadata";

// Il carrello dipende dallo stato locale del browser: niente da indicizzare,
// ma i link al catalogo restano da seguire.
export const metadata: Metadata = privatePageMetadata("Carrello", {
  follow: true,
});

export default function CarrelloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
