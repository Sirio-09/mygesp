import type { Metadata } from "next";
import AdminChrome from "@/components/admin/AdminChrome";
import { privatePageMetadata } from "@/lib/metadata";

// Le pagine dell'area tecnica sono tutte client o non esportano metadata:
// il titolo e il noindex arrivano da qui, una volta sola.
export const metadata: Metadata = privatePageMetadata("Area tecnica");

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminChrome>{children}</AdminChrome>;
}
