import type { Metadata } from "next";
import AdminAuthShell from "@/components/admin/AdminAuthShell";
import { privatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = privatePageMetadata("Accesso area tecnica");

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthShell>{children}</AdminAuthShell>;
}
