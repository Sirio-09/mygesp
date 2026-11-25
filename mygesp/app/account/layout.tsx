import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/metadata";

// Area personale: nessuna ragione per indicizzarla.
export const metadata: Metadata = privatePageMetadata("Area personale");

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
