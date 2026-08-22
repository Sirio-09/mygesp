"use client";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { useEffect, useState } from "react";

export default function CarrelloPage() {
  const { items, removeItem, updateQuantity, totalCents } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setError(data.error || "Errore durante il checkout");
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  if (items.length === 0) {
    return (
      <main className="max-w-[800px] mx-auto px-4 sm:px-8 py-16 text-center">
        <h1 className="text-ink font-extrabold text-2xl mb-4">
          Il tuo carrello è vuoto
        </h1>
        <Link href="/" className="text-grass-deep hover:underline">
          Torna allo shop →
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-[800px] mx-auto px-4 sm:px-8 py-12">
      <h1 className="text-ink font-extrabold text-2xl sm:text-3xl mb-8">
        Il tuo carrello
      </h1>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4"
          >
            <div>
              <p className="font-semibold text-ink">{item.productName}</p>
              <p className="text-sm text-ink-soft">Taglia: {item.size}</p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity(item.variantId, parseInt(e.target.value) || 1)
                }
                className="w-16 border border-line text-center py-1"
              />
              <span className="text-soil-deep font-bold w-20 text-right">
                €{((item.priceCents * item.quantity) / 100).toFixed(2)}
              </span>
              <button
                onClick={() => removeItem(item.variantId)}
                className="text-ink-soft hover:text-soil-deep text-sm"
              >
                Rimuovi
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center border-t-2 border-ink pt-4">
        <span className="font-bold text-ink">Totale</span>
        <span className="text-soil-deep text-2xl font-bold">
          €{(totalCents() / 100).toFixed(2)}
        </span>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="mt-8 bg-grass hover:bg-grass-deep text-white font-bold text-sm sm:text-base py-4 px-8 w-full disabled:opacity-50 transition-colors"
      >
        {loading ? "Attendere..." : "Procedi al checkout"}
      </button>
      {error && <p className="text-soil-deep text-sm mt-2 text-center">{error}</p>}
    </main>
  );
}