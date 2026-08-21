"use client";
import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setStatus("done");
    setEmail("");
  };

  if (status === "done") {
    return <p className="text-grass text-sm">Iscritto! Ti avviseremo sulle novità.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <p className="text-sm text-paper-warm/70 mb-1">Ricevi un avviso su sconti e novità.</p>
      <div className="flex gap-2">
        <input
          type="email"
          required
          placeholder="La tua email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white/10 border border-white/20 text-white placeholder:text-white/40 px-3 py-2 text-sm flex-1 min-w-0 focus:border-grass outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-grass hover:bg-grass-deep text-white text-sm font-semibold px-4 py-2 disabled:opacity-50 flex-shrink-0"
        >
          Iscriviti
        </button>
      </div>
    </form>
  );
}