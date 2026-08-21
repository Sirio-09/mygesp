"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
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
    <main className="min-h-[calc(100vh-64px)] bg-ink flex items-center justify-center px-4 sm:px-6 py-16">
      <div className="w-full max-w-[380px]">
        <div className="bg-white border border-dashed border-line py-3 px-4 -rotate-2 w-fit mb-6 mx-auto">
          <div className="text-[10px] tracking-wide text-ink-soft uppercase mb-1">Accesso riservato</div>
          <div className="text-sm font-bold text-soil-deep">Solo personale autorizzato</div>
        </div>

        <div className="bg-white border-t-4 border-grass p-8">
          <div className="text-grass-deep text-xs tracking-widest uppercase mb-2 font-bold text-center">
            MyGesp
          </div>
          <h1 className="text-ink font-extrabold text-2xl text-center mb-8">
            Area tecnica
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wide mb-1.5">
                Nome utente
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full border border-line px-3 py-2.5 text-sm text-ink focus:border-grass-deep outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wide mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-line px-3 py-2.5 text-sm text-ink focus:border-grass-deep outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-grass hover:bg-grass-deep text-white font-bold text-sm py-3.5 mt-2 disabled:opacity-50 transition-colors"
            >
              {loading ? "Verifica in corso..." : "Accedi"}
            </button>
            {error && (
              <p className="text-soil-deep text-sm text-center border-t border-dashed border-line pt-3 mt-1">
                {error}
              </p>
            )}
          </form>
        </div>

        <p className="text-white/70 text-xs text-center mt-6">
          Non sei un membro dello staff?{" "}
          <a href="/" className="text-grass hover:underline">
            Torna al sito
          </a>
        </p>
      </div>
    </main>
  );
}