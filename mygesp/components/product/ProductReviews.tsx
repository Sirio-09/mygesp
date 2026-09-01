"use client";

import { useState, useEffect, useCallback } from "react";
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
    if (!session) return;
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
  }, [session, productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    if (session) {
      checkPurchaseStatus();
    }
  }, [session, checkPurchaseStatus]);

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

  const average = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) return null;

  return (
    <section className="mt-14 sm:mt-16 border-t border-line pt-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-ink font-extrabold text-xl sm:text-2xl">
            Recensioni dei clienti
          </h2>
          {average ? (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-soil font-bold text-sm">★ {average} / 5</span>
              <span className="text-ink-soft text-sm">
                ({reviews.length} recension{reviews.length === 1 ? "e" : "i"})
              </span>
            </div>
          ) : (
            <p className="text-sm text-ink-soft mt-1">Ancora nessuna valutazione</p>
          )}
        </div>

        {/* LOGICA STATO UTENTE */}
        {!isLoadingSession && !showForm && (
          <div className="w-fit">
            {!session ? (
              <Link 
                href="/account/login"
                className="text-grass-deep hover:underline text-xs font-bold uppercase tracking-wider border border-line px-4 py-2 bg-paper-warm"
              >
                Accedi per recensire
              </Link>
            ) : hasReviewed ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-grass-deep bg-grass/10 px-3 py-1.5 rounded-full">
                ✓ Hai già recensito questo prodotto
              </span>
            ) : hasPurchased ? (
              <button
                onClick={() => setShowForm(true)}
                className="bg-grass hover:bg-grass-deep text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 transition-colors shadow-sm"
              >
                Scrivi una recensione
              </button>
            ) : (
              <span className="text-ink-soft text-xs italic">
                *Riservato a chi ha acquistato l&apos;articolo.
              </span>
            )}
          </div>
        )}
      </div>

      {/* FORM INSERIMENTO */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-paper-warm border border-line p-5 sm:p-6 mb-8 rounded-sm">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-4">
            La tua valutazione
          </h3>
          
          <div className="mb-4">
            <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">
              Voto
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
                  <span className={(hoverRating || rating) >= n ? "text-soil" : "text-line"}>
                    ★
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">
              Recensione
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={4}
              placeholder="Condividi la tua esperienza con questo prodotto..."
              className="w-full border border-line p-3 text-sm focus:border-grass-deep outline-none bg-white font-sans placeholder:text-ink-soft/50"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-grass hover:bg-grass-deep text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Invio in corso..." : "Pubblica recensione"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-ink-soft hover:text-ink text-xs font-bold uppercase tracking-wider px-3 py-2.5"
            >
              Annulla
            </button>
          </div>

          {error && <p className="text-red-600 text-xs mt-3 font-semibold">{error}</p>}
        </form>
      )}

      {/* LISTA RECENSIONI */}
      {reviews.length === 0 ? (
        <div className="text-center py-10 bg-paper-warm border border-line">
          <p className="text-ink-soft text-sm">Nessuna recensione ancora presente.</p>
        </div>
      ) : (
        <div className="divide-y divide-line">
          {reviews.map((review) => (
            <div key={review.id} className="py-5 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex text-soil text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-ink">
                    {review.customer?.name || review.customer?.email?.split("@")[0] || "Utente"}
                  </span>
                  <span className="inline-flex items-center text-[10px] font-bold text-grass-deep bg-grass/10 px-2 py-0.5 rounded-full">
                    Acquisto Verificato
                  </span>
                </div>
                <span className="text-xs text-ink-soft font-mono">
                  {new Date(review.createdAt).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-sm text-ink-soft leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}