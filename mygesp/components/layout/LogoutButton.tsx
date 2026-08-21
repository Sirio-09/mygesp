"use client";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-ink-soft hover:text-soil-deep text-sm"
    >
      Esci
    </button>
  );
}