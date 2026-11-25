import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = privatePageMetadata("Reimposta password");

export default function ReimpostaPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}