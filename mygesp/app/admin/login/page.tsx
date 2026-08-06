"use client"
import { useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const result = await signIn("admin-login", {
      username,
      password,
      redirect: false,
    })
    if (result?.error) {
      setError("Credenziali non valide")
      setLoading(false)
      return
    }

    // dopo login riuscito, controlla se è il primo accesso (2FA mai attivato)
    const sessionRes = await fetch("/api/auth/session")
    const sessionData = await sessionRes.json()
    const totpEnabled = sessionData?.user?.totpEnabled

    if (totpEnabled) {
      router.push("/admin/2fa-verify")
    } else {
      router.push("/admin/2fa-setup")
    }
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-loden-deep flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-95">
        <div className="bg-white border border-dashed border-mud py-3 px-4 -rotate-2 w-fit mb-6 mx-auto">
          <div className="text-[10px] tracking-wide text-slate uppercase mb-1">Accesso riservato</div>
          <div className="font-mono text-sm font-medium text-rust-deep">Solo personale autorizzato</div>
        </div>

        <div className="bg-canvas border-t-4 border-rust p-8">
          <div className="text-rust text-xs tracking-widest uppercase mb-2 font-semibold text-center">
            MyGesp
          </div>
          <h1 className="font-display text-2xl uppercase text-loden-deep tracking-wide text-center mb-8">
            Area tecnica
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate uppercase tracking-wide mb-1.5">
                Nome utente
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-white border border-mud px-3 py-2.5 text-sm text-loden-deep focus:border-rust focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate uppercase tracking-wide mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white border border-mud px-3 py-2.5 text-sm text-loden-deep focus:border-rust focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rust hover:bg-rust-deep text-white font-display uppercase tracking-wide text-sm font-semibold py-3.5 mt-2 disabled:opacity-50 transition-colors"
            >
              {loading ? "Verifica in corso..." : "Accedi"}
            </button>

            {error && (
              <p className="text-rust text-sm text-center border-t border-dashed border-mud pt-3 mt-1">
                {error}
              </p>
            )}
          </form>
        </div>

        <p className="text-canvas-deep text-xs text-center mt-6">
          Non sei un membro dello staff?{" "}
          <a href="/" className="text-signal hover:underline">
            Torna al sito
          </a>
        </p>
      </div>
    </main>
  );
}