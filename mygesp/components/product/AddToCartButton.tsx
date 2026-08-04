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
}: {
  variants: Variant[];
  productSlug: string;
  productName: string;
}) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState(variants[0]?.size ?? "");
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const selectedVariant = variants.find((v) => v.size === selectedSize);

  const handleAdd = () => {
    if (!selectedVariant) return;
    addItem({
      variantId: selectedVariant.id,
      productSlug,
      productName,
      size: selectedVariant.size,
      priceCents: selectedVariant.priceCents,
      quantity,
    });
    router.push("/carrello");
  };

  return (
    <div>
      <div className="mb-6">
        <div className="text-sm font-medium text-loden-deep mb-2">Taglia</div>
        <div className="flex gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedSize(v.size)}
              disabled={v.stock === 0}
              className={`border px-4 py-2 text-sm transition-colors ${
                selectedSize === v.size
                  ? "border-rust text-rust"
                  : "border-mud hover:border-rust hover:text-rust"
              } ${v.stock === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              {v.size}
              {v.stock === 0 && " (esaurito)"}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="text-sm font-medium text-loden-deep mb-2">Quantità</div>
        <div className="flex items-center border border-mud w-fit">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-9 h-9 flex items-center justify-center text-loden-deep hover:bg-canvas"
          >
            −
          </button>
          <span className="w-10 text-center font-mono text-sm">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(selectedVariant?.stock ?? 1, q + 1))}
            className="w-9 h-9 flex items-center justify-center text-loden-deep hover:bg-canvas"
          >
            +
          </button>
        </div>
      </div>

      {selectedVariant && (
        <div className="font-mono text-2xl font-medium text-rust-deep mb-6">
          €{((selectedVariant.priceCents * quantity) / 100).toFixed(2)}
        </div>
      )}

      <button
        onClick={handleAdd}
        disabled={!selectedVariant || selectedVariant.stock === 0}
        className="bg-rust hover:bg-rust-deep text-white font-display uppercase tracking-wide text-[15px] font-semibold py-4 px-8 w-full md:w-auto disabled:opacity-40"
      >
        Aggiungi al carrello
      </button>
    </div>
  );
}