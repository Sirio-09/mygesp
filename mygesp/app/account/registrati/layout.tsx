import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = privatePageMetadata("Registrati");

export default function RegistratiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}