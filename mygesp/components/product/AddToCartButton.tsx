'use client'

import { useState } from 'react'
import { useCartStore } from '@/lib/cart-store'

interface Variant {
  id: string
  size: string
  priceCents: number
  stock: number
}

interface AddToCartButtonProps {
  variants: Variant[]
  productSlug: string
  productName: string
  discountPercent?: number
}

export default function AddToCartButton({
  variants,
  productSlug,
  productName,
  discountPercent = 0,
}: AddToCartButtonProps) {
  const { addItem } = useCartStore()

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    variants[0]?.id || ''
  )
  const [quantity, setQuantity] = useState<number>(1)
  const [added, setAdded] = useState(false)

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || variants[0]

  const unitPriceCents = selectedVariant ? selectedVariant.priceCents : 0
  const hasDiscount = discountPercent > 0

  const discountedUnitPriceCents = hasDiscount
    ? Math.round((unitPriceCents * (100 - discountPercent)) / 100)
    : unitPriceCents

  const totalPriceCents = discountedUnitPriceCents * quantity
  const fullTotalPriceCents = unitPriceCents * quantity

  const formattedTotalPrice = (totalPriceCents / 100).toFixed(2)
  const formattedFullTotalPrice = (fullTotalPriceCents / 100).toFixed(2)

  const handleAddToCart = () => {
    if (!selectedVariant) return

    addItem({
      variantId: selectedVariant.id,
      productSlug,
      productName,
      size: selectedVariant.size,
      priceCents: discountedUnitPriceCents,
      quantity,
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Box Prezzo Dinamico in Alto con IVA Inclusa */}
      <div className="p-4 bg-paper-warm/50 border border-line rounded-lg space-y-1">
        <div className="flex items-baseline gap-3">
          {hasDiscount ? (
            <>
              <span className="text-3xl font-black text-soil">€{formattedTotalPrice}</span>
              <span className="text-lg text-ink-soft line-through">€{formattedFullTotalPrice}</span>
              <span className="px-2 py-0.5 bg-soil text-paper font-bold text-xs rounded uppercase">
                Risparmi il {discountPercent}%
              </span>
            </>
          ) : (
            <span className="text-3xl font-black text-ink">€{formattedTotalPrice}</span>
          )}
        </div>
        <p className="text-[11px] text-ink-soft uppercase font-medium">
          Prezzo IVA inclusa {quantity > 1 ? `(${quantity} pz)` : ''}
        </p>
      </div>

      {/* Selezione Taglia */}
      {variants.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase text-ink">
            Seleziona Taglia:
          </label>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const isSelected = v.id === selectedVariantId
              const isOutOfStock = v.stock <= 0

              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-md border transition-all ${
                    isSelected
                      ? 'border-grass bg-grass/10 text-grass-deep shadow-xs'
                      : 'border-line bg-paper text-ink hover:border-ink'
                  } ${isOutOfStock ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                >
                  {v.size}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Quantità e Bottone d'Acquisto senza Prezzo */}
      <div className="flex items-center gap-4 pt-2">
        <div className="flex items-center border border-line rounded-md bg-paper h-12">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 h-full text-ink hover:bg-paper-warm font-bold text-base"
          >
            -
          </button>
          <span className="px-4 h-full flex items-center font-bold text-sm border-x border-line">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() =>
              setQuantity((q) =>
                selectedVariant ? Math.min(selectedVariant.stock, q + 1) : q + 1
              )
            }
            className="px-3 h-full text-ink hover:bg-paper-warm font-bold text-base"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!selectedVariant || selectedVariant.stock <= 0}
          className="flex-1 h-12 bg-grass hover:bg-grass-deep text-paper font-bold text-xs uppercase tracking-wider rounded-md transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{added ? '✓ Aggiunto al Carrello!' : 'Aggiungi al Carrello'}</span>
        </button>
      </div>
    </div>
  )
}