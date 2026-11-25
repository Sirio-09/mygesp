import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/metadata";

// Pagina di transizione verso Stripe: fuori dall'indice.
export const metadata: Metadata = privatePageMetadata("Checkout");

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
