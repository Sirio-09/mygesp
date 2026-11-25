"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  // Il nome del cliente non è più esposto dall'API: campo opzionale
  customer?: { name: string | null; email: string } | null;
};

function Stars({ value, size = "md" }: { value: number; size?: "sm" | "md" }) {
  const dimension = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <span className="flex items-center gap-1" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className={`${dimension} ${n <= value ? "text-ink" : "text-line"}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2.6l2.86 6.05 6.64.79-4.93 4.6 1.31 6.56L12 17.4l-5.88 3.2 1.31-6.56L2.5 9.44l6.64-.79L12 2.6z" />
        </svg>
      ))}
    </span>
  );
}

export default function ProductReviews({
  productId,
  initialReviews,
}: {
  productId: string;
  /** Recensioni già calcolate sul server: niente fetch né skeleton al primo paint */
  initialReviews?: Review[];
}) {
  const { data: session, status } = useSession();
  const isLoadingSession = status === "loading";

  const isCustomer = Boolean(
    session?.user && (session.user as { role?: string })?.role === "customer"
  );

  const [reviews, setReviews] = useState<Review[]>(initialReviews ?? []);
  const [loading, setLoading] = useState(!initialReviews);
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
    // Con le recensioni dal server il fetch iniziale è superfluo:
    // resta attivo per il refresh dopo l'invio di una nuova recensione.
    if (initialReviews) return;
    loadReviews();
  }, [initialReviews, loadReviews]);

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

  if (loading) {
    return (
      <section aria-busy="true" aria-label="Caricamento recensioni">
        {/* Riserva lo spazio: senza skeleton la sezione compariva spingendo il footer */}
        <div className="mb-10 sm:mb-14">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
            Cosa ne pensano
          </p>
          <h2 className="text-3xl font-light tracking-tight text-ink sm:text-4xl">
            Recensioni
          </h2>
        </div>

        <div className="mb-10 grid items-start gap-12 sm:mb-14 lg:grid-cols-12 lg:gap-20">
          <div className="space-y-4 lg:col-span-7">
            <div className="h-16 w-48 animate-pulse bg-line/40" />
            <div className="h-1 w-full max-w-sm animate-pulse bg-line/40" />
            <div className="h-1 w-full max-w-sm animate-pulse bg-line/40" />
            <div className="h-1 w-full max-w-sm animate-pulse bg-line/40" />
          </div>
          <div className="h-40 border border-line/50 lg:col-span-5" />
        </div>
      </section>
    );
  }

  return (
    <section>
      {/* HEADER SEZIONE */}
      <div className="mb-10 sm:mb-14">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
          Cosa ne pensano
        </p>
        <h2 className="text-3xl font-light tracking-tight text-ink sm:text-4xl">
          Recensioni
        </h2>
      </div>

      <div className="mb-10 grid items-start gap-12 sm:mb-14 lg:grid-cols-12 lg:gap-20">
        {/* COLONNA SINISTRA: STATISTICHE */}
        <div className="lg:col-span-7">
          {average ? (
            <div>
              <div className="mb-8 flex items-center gap-6">
                <span className="text-6xl font-light leading-none tracking-tighter text-ink sm:text-7xl">
                  {average}
                </span>
                <div className="flex flex-col gap-2">
                  <Stars value={Math.round(Number(average))} />
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
                    <div key={stars} className="flex items-center gap-3">
                      <span className="w-4 text-right text-[11px] font-medium tabular-nums text-ink-soft">
                        {stars}
                      </span>
                      <svg
                        className="h-2.5 w-2.5 text-ink-soft/70"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M12 2.6l2.86 6.05 6.64.79-4.93 4.6 1.31 6.56L12 17.4l-5.88 3.2 1.31-6.56L2.5 9.44l6.64-.79L12 2.6z" />
                      </svg>
                      <div className="h-1 flex-1 overflow-hidden bg-line/40">
                        <div
                          className="h-full bg-ink transition-[width] duration-700 ease-out-expo"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-[10px] font-medium tabular-nums text-ink-soft">
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
          <div className="border border-line/50 bg-paper p-6 sm:p-8">
            {showForm ? (
              <form onSubmit={handleSubmit}>
                <h3 className="mb-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink">
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
                        aria-label={`${n} stelle`}
                        aria-pressed={rating === n}
                        className="p-0.5 transition-transform duration-200 ease-out-expo hover:scale-110"
                      >
                        <svg
                          className={`h-6 w-6 transition-colors duration-200 ${
                            (hoverRating || rating) >= n ? "text-ink" : "text-line"
                          }`}
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M12 2.6l2.86 6.05 6.64.79-4.93 4.6 1.31 6.56L12 17.4l-5.88 3.2 1.31-6.56L2.5 9.44l6.64-.79L12 2.6z" />
                        </svg>
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
                    className="w-full resize-none border border-line/60 bg-transparent p-4 text-sm font-light text-ink outline-none transition-colors duration-200 placeholder:text-ink-soft/70 focus:border-ink"
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
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink">
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
          <div className="mb-8 flex flex-col justify-between gap-4 border-b border-line/50 pb-4 sm:flex-row sm:items-center">
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
                  className="cursor-pointer appearance-none border-b border-line/60 bg-transparent pb-1 pr-6 text-[11px] font-medium uppercase tracking-[0.1em] text-ink outline-none transition-colors focus:border-ink"
                >
                  <option value="recent">Più recenti</option>
                  <option value="highest">Voti più alti</option>
                </select>
                <svg
                  className="pointer-events-none absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 text-ink"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* LISTA */}
          <div className="divide-y divide-line/50">
            {sortedReviews.map((review) => (
              <div key={review.id} className="py-8 first:pt-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                      <Stars value={review.rating} size="sm" />
                      <span className="border border-line px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.2em] text-ink-soft">
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
                
                <p className="max-w-[70ch] text-sm font-light leading-relaxed text-ink">
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