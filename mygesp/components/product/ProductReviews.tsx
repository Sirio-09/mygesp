"use client";
import { useState, useEffect } from "react";
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
  
  // Nuovo stato: l'utente ha comprato questo prodotto?
  const [hasPurchased, setHasPurchased] = useState<boolean | null>(null); 
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadReviews = async () => {
    try {
      const res = await fetch(`/api/recensioni/${productId}`);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error("Errore caricamento recensioni:", err);
    } finally {
      setLoading(false);
    }
  };

  // Funzione per controllare se l'utente ha acquistato il prodotto
  const checkPurchaseStatus = async () => {
    if (!session) return;
    try {
      // Dovrai creare questa API nel tuo backend per controllare gli ordini!
      const res = await fetch(`/api/recensioni/check-acquisto?productId=${productId}`);
      if (res.ok) {
        const data = await res.json();
        setHasPurchased(data.hasPurchased);
      } else {
        setHasPurchased(false);
      }
    } catch (err) {
      setHasPurchased(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  useEffect(() => {
    if (session) {
      checkPurchaseStatus();
    }
  }, [session, productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/recensioni", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, comment }),
    });

    setSubmitting(false);

    if (res.ok) {
      setShowForm(false);
      setComment("");
      setRating(5);
      loadReviews();
    } else {
      const data = await res.json();
      setError(data.error || "Errore durante l'invio");
    }
  };

  const average = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) return null;

  return (
    <section className="mt-14 sm:mt-16 border-t border-line pt-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-ink font-extrabold text-xl sm:text-2xl">
            Recensioni
          </h2>
          {average && (
            <p className="text-sm text-ink-soft mt-1">
              <span className="text-soil-deep font-bold">{average}/5</span>
              {" "}· {reviews.length} recension{reviews.length === 1 ? "e" : "i"}
            </p>
          )}
        </div>

        {/* LOGICA BOTTONI RECENSIONE */}
        {!isLoadingSession && !showForm && (
          <div className="w-fit">
            {!session ? (
              <Link 
                href="/account/login" // <-- Modifica qui se la tua pagina di login ha un URL diverso
                className="text-soil-deep hover:underline text-sm font-semibold uppercase tracking-wider"
              >
                Accedi per recensire
              </Link>
            ) : hasPurchased === true ? (
              <button
                onClick={() => setShowForm(true)}
                className="text-grass-deep hover:underline text-sm font-semibold"
              >
                Scrivi una recensione
              </button>
            ) : hasPurchased === false ? (
              <span className="text-ink-soft text-xs italic">
                *Solo chi ha acquistato l&apos;articolo può recensirlo.
              </span>
            ) : null}
          </div>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-paper-warm border border-line p-5 mb-8">
          <div className="mb-3">
            <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wide mb-1.5">
              Voto
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`text-2xl ${n <= rating ? "text-soil" : "text-line"}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wide mb-1.5">
              Recensione
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={3}
              placeholder="Come si comporta sul campo?"
              className="w-full border border-line px-3 py-2 text-sm focus:border-grass-deep outline-none bg-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-grass hover:bg-grass-deep text-white text-sm font-semibold px-4 py-2 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Invio..." : "Pubblica recensione"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-ink-soft hover:text-soil-deep text-sm"
            >
              Annulla
            </button>
          </div>
          {error && <p className="text-soil-deep text-sm mt-2">{error}</p>}
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="text-ink-soft text-sm">Nessuna recensione ancora per questo prodotto.</p>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-line pb-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-soil text-sm">
                  {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                </span>
                <span className="text-sm font-semibold text-ink">
                  {review.customer?.name || review.customer?.email?.split("@")[0] || "Utente"}
                </span>
              </div>
              <p className="text-sm text-ink-soft">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}