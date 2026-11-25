"use client";

// SiteChrome.tsx
// Decide se mostrare l'intelaiatura della vetrina (banner, navbar, footer,
// carrello a comparsa). L'area tecnica ha una sua navigazione: qui viene
// "spenta" in base al pathname, senza spostare file o cambiare URL.

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function isAdminPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export default function SiteChrome({
  navbar,
  footer,
  cart,
  children,
}: {
  navbar: ReactNode;
  footer: ReactNode;
  cart: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();

  if (isAdminPath(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      {navbar}
      {children}
      {footer}
      {cart}
    </>
  );
}
