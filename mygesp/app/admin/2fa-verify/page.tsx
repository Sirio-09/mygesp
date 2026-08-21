"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function VerifyOtpPage() {
  const router = useRouter();
  const { update } = useSession();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/2fa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (res.ok) {
      await update({ otpVerified: true });
      router.push("/admin");
    } else {
      setError("Codice non valido");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-ink flex items-center justify-center px-4 sm:px-6 py-16">
      <div className="w-full max-w-[380px]">
        <div className="bg-white border-t-4 border-grass p-8">
          <h1 className="text-ink font-extrabold text-2xl text-center mb-2">
            Verifica in due passaggi
          </h1>
          <p className="text-sm text-ink-soft text-center mb-6">
            Inserisci il codice dalla tua app di autenticazione.
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              autoFocus
              className="w-full border border-line px-3 py-2.5 text-sm text-ink text-center tracking-widest focus:border-grass-deep outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-grass hover:bg-grass-deep text-white font-bold text-sm py-3.5 disabled:opacity-50 transition-colors"
            >
              {loading ? "Verifica in corso..." : "Conferma"}
            </button>
            {error && <p className="text-soil-deep text-sm text-center">{error}</p>}
          </form>
        </div>
      </div>
    </main>
  );
}