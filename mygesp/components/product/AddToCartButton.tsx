"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";

type Variant = {
  id: string;
  size: string;
  priceCents: number;
  stock: number;
};

export default function AddToCartButton({
  variants,
  productSlug,
  productName,
  discountPercent,
  productImage, // Aggiunto!
}: {
  variants: Variant[];
  productSlug: string;
  productName: string;
  discountPercent?: number | null;
  productImage?: string | null; // Aggiunto!
}) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState(variants[0]?.size ?? "");
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const selectedVariant = variants.find((v) => v.size === selectedSize);
  const finalPriceCents = selectedVariant && discountPercent
    ? Math.round(selectedVariant.priceCents * (1 - discountPercent / 100))
    : selectedVariant?.priceCents;

  const handleAdd = () => {
    if (!selectedVariant) return;
    
    addItem({
      variantId: selectedVariant.id,
      productSlug,
      productName,
      size: selectedVariant.size,
      priceCents: finalPriceCents ?? selectedVariant.priceCents,
      quantity,
      image: productImage, // Ora l'immagine viene finalmente inviata allo store del carrello!
    });
    
    router.push("/carrello");
  };

  return (
    <div>
      <div className="mb-6">
        <div className="text-sm font-semibold text-ink mb-2">Taglia</div>
        <div className="flex gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedSize(v.size)}
              disabled={v.stock === 0}
              className={`border px-4 py-2 text-sm transition-colors ${
                selectedSize === v.size
                  ? "border-grass-deep text-grass-deep"
                  : "border-line hover:border-grass-deep hover:text-grass-deep"
              } ${v.stock === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              {v.size}
              {v.stock === 0 && " (esaurito)"}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="text-sm font-semibold text-ink mb-2">Quantità</div>
        <div className="flex items-center border border-line w-fit">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-9 h-9 flex items-center justify-center text-ink hover:bg-paper-warm"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-medium">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(selectedVariant?.stock ?? 1, q + 1))}
            className="w-9 h-9 flex items-center justify-center text-ink hover:bg-paper-warm"
          >
            +
          </button>
        </div>
      </div>

      {selectedVariant && (
        <div className="flex items-baseline gap-3 mb-6">
          {discountPercent ? (
            <>
              <span className="text-line line-through text-base">
                €{((selectedVariant.priceCents * quantity) / 100).toFixed(2)}
              </span>
              <span className="text-soil-deep text-2xl font-bold">
                €{(((finalPriceCents ?? 0) * quantity) / 100).toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-soil-deep text-2xl font-bold">
              €{((selectedVariant.priceCents * quantity) / 100).toFixed(2)}
            </span>
          )}
        </div>
      )}

      <button
        onClick={handleAdd}
        disabled={!selectedVariant || selectedVariant.stock === 0}
        className="bg-grass hover:bg-grass-deep text-white font-bold text-sm sm:text-base uppercase tracking-wide py-4 px-8 w-full md:w-auto disabled:opacity-40 transition-colors"
      >
        Aggiungi al carrello
      </button>
    </div>
  );
}