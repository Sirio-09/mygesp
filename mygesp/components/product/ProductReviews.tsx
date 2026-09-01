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

  const isCustomer = Boolean(
    session?.user && (session.user as { role?: string })?.role === "customer"
  );

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [hasPurchased, setHasPurchased] = useState<boolean | null>(null);
  const [hasReviewed, setHasReviewed] = useState<boolean | null>(null);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
    <section>
      {/* HEADER SEZIONE */}
      <div className="mb-12 md:mb-16">
        <p className="text-ink-soft text-[10px] font-semibold uppercase tracking-[0.2em] mb-4">
          Cosa ne pensano
        </p>
        <h2 className="text-ink font-light text-3xl sm:text-4xl tracking-tight">
          Recensioni
        </h2>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start mb-16">
        {/* COLONNA SINISTRA: STATISTICHE */}
        <div className="lg:col-span-7">
          {average ? (
            <div>
              <div className="flex items-center gap-6 mb-8">
                <span className="text-6xl sm:text-7xl font-light tracking-tighter text-ink leading-none">
                  {average}
                </span>
                <div className="flex flex-col gap-2">
                  <div className="text-ink text-lg tracking-widest flex">
                    {"★".repeat(Math.round(Number(average)))}
                    <span className="text-line/40">
                      {"★".repeat(5 - Math.round(Number(average)))}
                    </span>
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                    Basato su {totalReviews} recension{totalReviews === 1 ? "e" : "i"}
                  </p>
                </div>
              </div>

              {/* BARRE DISTRIBUZIONE VOTI */}
              <div className="max-w-sm space-y-3">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratingCounts[stars as keyof typeof ratingCounts];
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-4">
                      <span className="w-4 text-[11px] font-medium text-ink-soft text-right">
                        {stars}
                      </span>
                      <span className="text-[10px] text-ink-soft">★</span>
                      <div className="flex-1 h-1 bg-line/20 overflow-hidden">
                        <div
                          className="h-full bg-ink transition-all duration-700 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-6 text-[10px] font-medium text-ink-soft text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-ink-soft text-sm font-light">
              Questo prodotto non ha ancora ricevuto recensioni.
            </p>
          )}
        </div>

        {/* COLONNA DESTRA: AZIONI / FORM */}
        <div className="lg:col-span-5">
          <div className="border border-line/40 p-6 sm:p-8 bg-paper">
            {showForm ? (
              <form onSubmit={handleSubmit}>
                <h3 className="text-[11px] font-semibold text-ink uppercase tracking-[0.2em] mb-6">
                  Scrivi una recensione
                </h3>

                <div className="mb-6">
                  <label className="block text-[10px] font-semibold text-ink-soft uppercase tracking-[0.2em] mb-3">
                    Valutazione
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
                            (hoverRating || rating) >= n ? "text-ink" : "text-line/40"
                          }
                        >
                          ★
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-[10px] font-semibold text-ink-soft uppercase tracking-[0.2em] mb-3">
                    Il tuo commento
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    rows={4}
                    placeholder="Racconta la tua esperienza con il prodotto..."
                    className="w-full bg-transparent border border-line/60 p-4 text-sm font-light text-ink focus:border-ink outline-none transition-colors placeholder:text-ink-soft/40 resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-ink text-white hover:bg-grass text-[11px] font-medium uppercase tracking-[0.2em] py-3 px-6 disabled:opacity-30 disabled:hover:bg-ink transition-colors duration-300"
                  >
                    {submitting ? "Invio..." : "Pubblica"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 border border-line/60 text-ink hover:border-ink text-[11px] font-medium uppercase tracking-[0.2em] py-3 px-6 transition-colors duration-300"
                  >
                    Annulla
                  </button>
                </div>

                {error && (
                  <p className="text-red-500 text-xs mt-4 font-medium">{error}</p>
                )}
              </form>
            ) : (
              <div className="flex flex-col items-start gap-4">
                <h3 className="text-[11px] font-semibold text-ink uppercase tracking-[0.2em] mb-2">
                  La tua opinione
                </h3>
                
                {!isLoadingSession && (
                  <>
                    {!isCustomer ? (
                      <div className="w-full space-y-4">
                        <p className="text-sm font-light text-ink-soft">
                          Devi aver effettuato l&apos;accesso per poter recensire i nostri prodotti.
                        </p>
                        <Link
                          href="/account/login"
                          className="block text-center w-full border border-ink text-ink hover:bg-ink hover:text-white text-[11px] font-medium uppercase tracking-[0.2em] py-3 px-6 transition-colors duration-300"
                        >
                          Accedi al tuo account
                        </Link>
                      </div>
                    ) : hasReviewed ? (
                      <p className="text-sm font-light text-ink-soft">
                        Hai già condiviso la tua opinione su questo prodotto. Ti ringraziamo!
                      </p>
                    ) : hasPurchased ? (
                      <button
                        onClick={() => setShowForm(true)}
                        className="w-full bg-ink text-white hover:bg-grass text-[11px] font-medium uppercase tracking-[0.2em] py-3 px-6 transition-colors duration-300"
                      >
                        Scrivi recensione
                      </button>
                    ) : (
                      <p className="text-sm font-light text-ink-soft italic">
                        Solo chi ha completato l&apos;acquisto di questo articolo può lasciare una recensione.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEZIONE LISTA RECENSIONI */}
      {reviews.length > 0 && (
        <div>
          {/* BARRA ORDINAMENTO */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line/40 mb-8">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
              {totalReviews} Recension{totalReviews === 1 ? "e" : "i"}
            </span>

            <div className="flex items-center gap-3">
              <label htmlFor="sort-reviews" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                Ordina per
              </label>
              <div className="relative">
                <select
                  id="sort-reviews"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "recent" | "highest")}
                  className="appearance-none bg-transparent text-[11px] font-medium uppercase tracking-[0.1em] text-ink border-b border-line/60 focus:border-ink outline-none cursor-pointer pr-6 pb-1 transition-colors"
                >
                  <option value="recent">Più recenti</option>
                  <option value="highest">Voti più alti</option>
                </select>
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[8px] text-ink pointer-events-none">
                  ▼
                </span>
              </div>
            </div>
          </div>

          {/* LISTA */}
          <div className="divide-y divide-line/40">
            {sortedReviews.map((review) => (
              <div key={review.id} className="py-8 first:pt-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-ink tracking-widest">
                        {"★".repeat(review.rating)}
                        <span className="text-line/40">
                          {"★".repeat(5 - review.rating)}
                        </span>
                      </span>
                      <span className="border border-line/60 px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] font-medium text-ink-soft">
                        Acquisto Verificato
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-ink">
                      {review.customer?.name ||
                        review.customer?.email?.split("@")[0] ||
                        "Cliente"}
                    </span>
                  </div>
                  
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-soft">
                    {new Date(review.createdAt).toLocaleDateString("it-IT", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                
                <p className="text-sm font-light text-ink leading-relaxed max-w-4xl">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}