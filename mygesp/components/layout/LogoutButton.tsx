"use client";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-mud hover:text-rust text-sm"
    >
      Esci
    </button>
  );
}