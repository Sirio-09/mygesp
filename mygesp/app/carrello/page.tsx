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
      <main className="max-w-[800px] mx-auto px-8 py-16 text-center">
        <h1 className="font-display text-2xl uppercase text-loden-deep mb-4">
          Il tuo carrello è vuoto
        </h1>
        <Link href="/" className="text-rust hover:underline">
          Torna allo shop →
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-[800px] mx-auto px-8 py-12">
      <h1 className="font-display text-3xl uppercase text-loden-deep tracking-wide mb-8">
        Il tuo carrello
      </h1>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex items-center justify-between border-b border-dashed border-mud pb-4"
          >
            <div>
              <p className="font-medium text-loden-deep">{item.productName}</p>
              <p className="text-sm text-mud">Taglia: {item.size}</p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity(item.variantId, parseInt(e.target.value) || 1)
                }
                className="w-16 border border-mud text-center py-1"
              />
              <span className="font-mono text-rust-deep w-20 text-right">
                €{((item.priceCents * item.quantity) / 100).toFixed(2)}
              </span>
              <button
                onClick={() => removeItem(item.variantId)}
                className="text-mud hover:text-rust text-sm"
              >
                Rimuovi
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center border-t-2 border-loden pt-4">
        <span className="font-display uppercase text-loden-deep">Totale</span>
        <span className="font-mono text-2xl font-medium text-rust-deep">
          €{(totalCents() / 100).toFixed(2)}
        </span>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="mt-8 bg-rust hover:bg-rust-deep text-white font-display uppercase tracking-wide text-[15px] font-semibold py-4 px-8 w-full disabled:opacity-50"
      >
        {loading ? "Attendere..." : "Procedi al checkout"}
      </button>
      {error && <p className="text-rust text-sm mt-2 text-center">{error}</p>}
    </main>
  );
}