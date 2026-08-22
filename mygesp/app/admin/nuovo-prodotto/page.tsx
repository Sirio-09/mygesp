"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function NuovoProdotto() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "", slug: "", brand: "", category: "",
    waterColumn: "", minTemp: "",
    discountPercent: "", discountUntil: "",
  })
  const [featured, setFeatured] = useState(false)
  const [descriptionBlocks, setDescriptionBlocks] = useState([{ title: "", text: "" }])
  const [variants, setVariants] = useState([{ size: "", sku: "", priceCents: "", stock: "" }])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleBlockChange = (index: number, field: "title" | "text", value: string) => {
    const updated = [...descriptionBlocks]
    updated[index] = { ...updated[index], [field]: value }
    setDescriptionBlocks(updated)
  }

  const addBlock = () => {
    setDescriptionBlocks([...descriptionBlocks, { title: "", text: "" }])
  }

  const removeBlock = (index: number) => {
    setDescriptionBlocks(descriptionBlocks.filter((_, i) => i !== index))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setImageFiles((prev) => [...prev, ...files])
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))])
  }

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleVariantChange = (index: number, field: string, value: string) => {
    const updated = [...variants]
    updated[index] = { ...updated[index], [field]: value }
    setVariants(updated)
  }

  const addVariant = () => {
    setVariants([...variants, { size: "", sku: "", priceCents: "", stock: "" }])
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setUploading(true)

    const uploadedUrls: string[] = []
    for (const file of imageFiles) {
      const formData = new FormData()
      formData.append("file", file)
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) {
        setError("Errore durante il caricamento di un'immagine")
        setUploading(false)
        return
      }
      uploadedUrls.push(uploadData.url)
    }

    const res = await fetch("/api/admin/prodotti", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, images: uploadedUrls, variants, descriptionBlocks, featured }),
    })

    setUploading(false)

    if (res.ok) {
      router.push("/admin")
    } else {
      setError("Errore nel salvataggio, controlla i campi")
    }
  }

  return (
    <main className="max-w-[720px] mx-auto px-4 sm:px-8 py-12">
      <h1 className="text-ink font-extrabold text-3xl mb-2">
        Nuovo prodotto
      </h1>
      <p className="text-ink-soft text-sm mb-8">Compila i campi per aggiungere un articolo al catalogo.</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-semibold text-ink mb-2">Immagini prodotto</label>
          <div className="flex flex-wrap items-center gap-3">
            {imagePreviews.map((src, i) => (
              <div key={i} className="w-24 h-24 relative border border-line">
                <Image src={src} alt={`Immagine ${i + 1}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-soil-deep text-white w-5 h-5 flex items-center justify-center text-xs rounded-full"
                >
                  ✕
                </button>
              </div>
            ))}
            <label className="w-24 h-24 bg-paper-warm border-2 border-dashed border-line flex items-center justify-center text-xs text-ink-soft text-center cursor-pointer hover:border-grass-deep transition-colors">
              <span>+ Aggiungi</span>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
            </label>
          </div>
          <p className="text-xs text-ink-soft mt-2">La prima immagine è quella mostrata in homepage e nella griglia prodotti.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-ink mb-1">Nome prodotto</label>
            <input name="name" value={form.name} onChange={handleChange} required
              className="w-full border border-line px-3 py-2 focus:border-grass-deep outline-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-ink mb-1">Slug (URL)</label>
            <input name="slug" value={form.slug} onChange={handleChange} required
              placeholder="es. giacca-uragan-tex"
              className="w-full border border-line px-3 py-2 focus:border-grass-deep outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">Marchio</label>
            <input name="brand" value={form.brand} onChange={handleChange} required
              className="w-full border border-line px-3 py-2 focus:border-grass-deep outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">Categoria</label>
            <input name="category" value={form.category} onChange={handleChange} required
              className="w-full border border-line px-3 py-2 focus:border-grass-deep outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">Colonna d&apos;acqua (mm)</label>
            <input name="waterColumn" value={form.waterColumn} onChange={handleChange}
              className="w-full border border-line px-3 py-2 focus:border-grass-deep outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">Temperatura minima (°C)</label>
            <input name="minTemp" value={form.minTemp} onChange={handleChange}
              className="w-full border border-line px-3 py-2 focus:border-grass-deep outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">Sconto (%)</label>
            <input name="discountPercent" value={form.discountPercent} onChange={handleChange}
              placeholder="es. 20"
              className="w-full border border-line px-3 py-2 focus:border-grass-deep outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">Sconto valido fino al</label>
            <input type="date" name="discountUntil" value={form.discountUntil} onChange={handleChange}
              className="w-full border border-line px-3 py-2 focus:border-grass-deep outline-none" />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="w-4 h-4 accent-grass-deep"
          />
          <span className="text-sm font-semibold text-ink">Metti in evidenza in homepage</span>
        </label>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-ink">Descrizione (a blocchi)</label>
            <button type="button" onClick={addBlock} className="text-sm text-grass-deep hover:underline">
              + Aggiungi blocco
            </button>
          </div>
          <div className="space-y-3">
            {descriptionBlocks.map((block, i) => (
              <div key={i} className="border border-line p-3 relative">
                <input
                  placeholder="Titolo del blocco (es. Impermeabilità totale)"
                  value={block.title}
                  onChange={(e) => handleBlockChange(i, "title", e.target.value)}
                  className="w-full border-b border-line px-1 py-1.5 text-sm font-semibold mb-2 focus:border-grass-deep outline-none"
                />
                <textarea
                  placeholder="Testo del blocco"
                  value={block.text}
                  onChange={(e) => handleBlockChange(i, "text", e.target.value)}
                  rows={2}
                  className="w-full px-1 py-1 text-sm focus:outline-none resize-y"
                />
                {descriptionBlocks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBlock(i)}
                    className="absolute top-2 right-2 text-ink-soft hover:text-soil-deep text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-ink">Taglie e prezzi</label>
            <button type="button" onClick={addVariant} className="text-sm text-grass-deep hover:underline">
              + Aggiungi taglia
            </button>
          </div>
          <div className="space-y-2">
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-center">
                <input placeholder="Taglia" value={v.size} onChange={(e) => handleVariantChange(i, "size", e.target.value)} required
                  className="border border-line px-2 py-1.5 text-sm focus:border-grass-deep outline-none" />
                <input placeholder="SKU" value={v.sku} onChange={(e) => handleVariantChange(i, "sku", e.target.value)} required
                  className="border border-line px-2 py-1.5 text-sm focus:border-grass-deep outline-none" />
                <input placeholder="Prezzo (centesimi)" value={v.priceCents} onChange={(e) => handleVariantChange(i, "priceCents", e.target.value)} required
                  className="border border-line px-2 py-1.5 text-sm focus:border-grass-deep outline-none" />
                <input placeholder="Quantità" value={v.stock} onChange={(e) => handleVariantChange(i, "stock", e.target.value)} required
                  className="border border-line px-2 py-1.5 text-sm focus:border-grass-deep outline-none" />
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(i)} className="text-ink-soft hover:text-soil-deep text-sm">
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={uploading}
          className="bg-grass hover:bg-grass-deep text-white font-bold text-sm py-4 px-8 w-full disabled:opacity-50 transition-colors">
          {uploading ? "Salvataggio in corso..." : "Salva prodotto"}
        </button>
        {error && <p className="text-soil-deep text-sm text-center">{error}</p>}
      </form>
    </main>
  );
}