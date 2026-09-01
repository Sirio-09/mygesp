"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  customer: { name: string | null; email: string };
};

export default function ProductReviews({ productId }: { productId: string }) {
  const { data: session, status } = useSession();
  const isLoadingSession = status === "loading";

  // Verifica se l'utente è loggato ed è un CLIENTE (non admin)
  const isCustomer = Boolean(
    session?.user && (session.user as { role?: string })?.role === "customer"
  );

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Stato verifica acquisto e recensione esistente
  const [hasPurchased, setHasPurchased] = useState<boolean | null>(null);
  const [hasReviewed, setHasReviewed] = useState<boolean | null>(null);

  // Stato form
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Stato ordinamento: "recent" (più recenti) | "highest" (voti più alti)
  const [sortBy, setSortBy] = useState<"recent" | "highest">("recent");

  const loadReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/recensioni/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Errore caricamento recensioni:", err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const checkPurchaseStatus = useCallback(async () => {
    if (!isCustomer) return;
    try {
      const res = await fetch(`/api/recensioni/check-acquisto?productId=${productId}`);
      if (res.ok) {
        const data = await res.json();
        setHasPurchased(data.hasPurchased);
        setHasReviewed(data.hasReviewed);
      } else {
        setHasPurchased(false);
        setHasReviewed(false);
      }
    } catch {
      setHasPurchased(false);
      setHasReviewed(false);
    }
  }, [isCustomer, productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    if (isCustomer) {
      checkPurchaseStatus();
    }
  }, [isCustomer, checkPurchaseStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/recensioni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      });

      if (res.ok) {
        setShowForm(false);
        setComment("");
        setRating(5);
        setHasReviewed(true);
        loadReviews();
      } else {
        const data = await res.json();
        setError(data.error || "Errore durante l'invio");
      }
    } catch {
      setError("Errore di rete. Riprova più tardi.");
    } finally {
      setSubmitting(false);
    }
  };

  // Calcolo statistiche e media voti
  const totalReviews = reviews.length;
  const average =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : null;

  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        counts[r.rating as keyof typeof counts]++;
      }
    });
    return counts;
  }, [reviews]);

  // Ordinamento dinamico della lista
  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (sortBy === "highest") {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [reviews, sortBy]);

  if (loading) return null;

  return (
    <section className="mt-14 sm:mt-16 border-t border-line pt-10">
      {/* HEADER RECENSIONI E AZIONI UTENTE */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <h2 className="text-ink font-extrabold text-xl sm:text-2xl">
            Recensioni
          </h2>

          {average ? (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-extrabold font-mono text-ink">
                  {average}
                </span>
                <div>
                  <div className="text-soil text-sm">
                    {"★".repeat(Math.round(Number(average)))}
                    {"☆".repeat(5 - Math.round(Number(average)))}
                  </div>
                  <p className="text-xs text-ink-soft">
                    Basato su {totalReviews} recension{totalReviews === 1 ? "e" : "i"}
                  </p>
                </div>
              </div>

              {/* BARRE DISTRIBUZIONE VOTI */}
              <div className="w-64 space-y-1 pt-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratingCounts[stars as keyof typeof ratingCounts];
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center text-xs text-ink-soft gap-2">
                      <span className="w-4 font-mono font-bold text-right">{stars}★</span>
                      <div className="flex-1 h-2 bg-paper-warm border border-line overflow-hidden">
                        <div
                          className="h-full bg-soil transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-6 font-mono text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-soft mt-1">Ancora nessuna valutazione.</p>
          )}
        </div>

        {/* LOGICA DIRITTI RECENSIONE */}
        {!isLoadingSession && !showForm && (
          <div className="bg-paper-warm border border-line p-4 md:max-w-xs w-full h-fit">
            {!isCustomer ? (
              <div className="space-y-2 text-center md:text-center">
                <p className="text-xs text-ink-soft">
                  {session
                    ? "Accedi per recensire."
                    : "Vuoi valutare questo prodotto?"}
                </p>
                <Link
                  href="/account/login"
                  className="block w-full text-center bg-white border border-line hover:bg-paper text-ink text-xs font-bold uppercase tracking-wider py-2.5 transition-colors"
                >
                  Accedi
                </Link>
              </div>
            ) : hasReviewed ? (
              <div className="text-xs font-bold text-grass-deep flex items-center gap-2">
                <span>✓</span>
                <span>Hai già inviato una recensione per questo prodotto.</span>
              </div>
            ) : hasPurchased ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-grass hover:bg-grass-deep text-white text-xs font-bold uppercase tracking-wider py-2.5 transition-colors shadow-sm"
              >
                Scrivi una recensione
              </button>
            ) : (
              <p className="text-xs text-ink-soft italic leading-relaxed">
                * Solo chi ha acquistato questo prodotto può lasciare una recensione.
              </p>
            )}
          </div>
        )}
      </div>

      {/* FORM SCRITTURA RECENSIONE */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-paper-warm border border-line p-5 sm:p-6 mb-8"
        >
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-4">
            Valuta il prodotto
          </h3>

          <div className="mb-4">
            <label className="block text-[11px] font-bold text-ink-soft uppercase tracking-wide mb-1.5">
              Il tuo voto
            </label>
            <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  className="text-2xl transition-transform hover:scale-110 focus:outline-none"
                >
                  <span
                    className={
                      (hoverRating || rating) >= n ? "text-soil" : "text-line"
                    }
                  >
                    ★
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[11px] font-bold text-ink-soft uppercase tracking-wide mb-1.5">
              Recensione
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={4}
              placeholder="Come si comporta sul campo? Qualità, vestibilità, resistenza..."
              className="w-full border border-line p-3 text-sm focus:border-grass-deep outline-none bg-white font-sans placeholder:text-ink-soft/40"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-grass hover:bg-grass-deep text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Invio in corso..." : "Pubblica Recensione"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-ink-soft hover:text-ink text-xs font-bold uppercase tracking-wider px-3 py-2.5"
            >
              Annulla
            </button>
          </div>

          {error && (
            <p className="text-red-600 text-xs mt-3 font-bold">{error}</p>
          )}
        </form>
      )}

      {/* SELETTORE ORDINAMENTO E LISTA RECENSIONI */}
      {reviews.length > 0 && (
        <div className="flex items-center justify-between pb-4 border-b border-line mb-4">
          <span className="text-xs font-bold uppercase text-ink tracking-wider">
            {totalReviews} Recension{totalReviews === 1 ? "e" : "i"}
          </span>

          {/* Filtro Ordinamento */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort-reviews" className="text-xs text-ink-soft">
              Ordina per:
            </label>
            <select
              id="sort-reviews"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "recent" | "highest")}
              className="bg-white border border-line text-xs font-bold text-ink px-2.5 py-1.5 focus:outline-none focus:border-grass-deep"
            >
              <option value="recent">Più recenti</option>
              <option value="highest">Voti più alti</option>
            </select>
          </div>
        </div>
      )}

      {/* LISTA RECENSIONI */}
      {sortedReviews.length === 0 ? (
        <div className="text-center py-10 bg-paper-warm/50 border border-line">
          <p className="text-ink-soft text-sm">
            Nessuna recensione pubblicata al momento.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-line">
          {sortedReviews.map((review) => (
            <div key={review.id} className="py-5 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex text-soil text-xs">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>
                  <span className="text-xs font-bold text-ink">
                    {review.customer?.name ||
                      review.customer?.email?.split("@")[0] ||
                      "Cliente MyGesp"}
                  </span>
                  <span className="text-[10px] font-bold text-grass-deep bg-grass/10 px-2 py-0.5 rounded-full border border-grass/20">
                    Acquisto Verificato
                  </span>
                </div>
                <span className="text-[11px] text-ink-soft font-mono">
                  {new Date(review.createdAt).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-sm text-ink-soft leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}