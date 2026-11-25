import type { Metadata } from "next";
import AdminAuthShell from "@/components/admin/AdminAuthShell";
import { privatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = privatePageMetadata("Configurazione 2FA");

export default function DueFattoriSetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthShell>{children}</AdminAuthShell>;
}
