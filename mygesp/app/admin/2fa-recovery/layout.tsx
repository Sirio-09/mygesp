import type { Metadata } from "next";
import AdminAuthShell from "@/components/admin/AdminAuthShell";
import { privatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = privatePageMetadata("Recupero 2FA");

export default function DueFattoriRecoveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthShell>{children}</AdminAuthShell>;
}
