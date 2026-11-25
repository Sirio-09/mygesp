import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = privatePageMetadata("Password dimenticata");

export default function PasswordDimenticataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}