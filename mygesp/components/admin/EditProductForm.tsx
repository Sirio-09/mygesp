"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type Variant = {
  id: string;
  size: string;
  sku: string;
  priceCents: number;
  stock: number;
};

type DescriptionBlock = {
  title: string;
  text: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  shortTitle?: string | null;
  shortDescription?: string | null;
  descriptionBlocks: unknown;
  brand: string;
  category: string;
  waterColumn: number | null;
  minTemp: number | null;
  featured?: boolean;
  discountPercent?: number | null;
  discountUntil?: string | Date | null;
  images: string[];
  variants: Variant[];
};

export default function EditProductForm({ product }: { product: Product }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: product.name,
    slug: product.slug,
    shortTitle: product.shortTitle ?? "",
    shortDescription: product.shortDescription ?? "",
    brand: product.brand,
    category: product.category,
    waterColumn: product.waterColumn?.toString() ?? "",
    minTemp: product.minTemp?.toString() ?? "",
    featured: product.featured ?? false,
    discountPercent: product.discountPercent?.toString() ?? "",
    discountUntil: product.discountUntil
      ? new Date(product.discountUntil).toISOString().split("T")[0]
      : "",
  });

  const [descriptionBlocks, setDescriptionBlocks] = useState<DescriptionBlock[]>(
    Array.isArray(product.descriptionBlocks) && product.descriptionBlocks.length > 0
      ? (product.descriptionBlocks as DescriptionBlock[])
      : [{ title: "", text: "" }]
  );

  const [variants, setVariants] = useState(
    product.variants.map((v) => ({
      size: v.size,
      sku: v.sku,
      priceCents: v.priceCents.toString(),
      stock: v.stock.toString(),
    }))
  );

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(product.images);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBlockChange = (index: number, field: "title" | "text", value: string) => {
    const updated = [...descriptionBlocks];
    updated[index] = { ...updated[index], [field]: value };
    setDescriptionBlocks(updated);
  };

  const addBlock = () => {
    setDescriptionBlocks([...descriptionBlocks, { title: "", text: "" }]);
  };

  const removeBlock = (index: number) => {
    setDescriptionBlocks(descriptionBlocks.filter((_, i) => i !== index));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: string, value: string) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const addVariant = () => {
    setVariants([...variants, { size: "", sku: "", priceCents: "", stock: "" }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUploading(true);

    const existingUrls = imagePreviews.filter((src) => !src.startsWith("blob:"));

    const uploadedUrls: string[] = [];
    for (const file of imageFiles) {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setError("Errore durante il caricamento di un'immagine");
        setUploading(false);
        return;
      }
      uploadedUrls.push(uploadData.url);
    }

    const allImages = [...existingUrls, ...uploadedUrls];

    const payload = {
      ...form,
      shortTitle: form.shortTitle.trim() ? form.shortTitle.trim() : null,
      shortDescription: form.shortDescription.trim() ? form.shortDescription.trim() : null,
      waterColumn: form.waterColumn ? Number(form.waterColumn) : null,
      minTemp: form.minTemp ? Number(form.minTemp) : null,
      featured: Boolean(form.featured),
      discountPercent: form.discountPercent ? Number(form.discountPercent) : 0,
      discountUntil: form.discountUntil ? new Date(form.discountUntil).toISOString() : null,
      images: allImages,
      variants,
      descriptionBlocks,
    };

    const res = await fetch(`/api/admin/prodotti/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setUploading(false);

    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Errore nel salvataggio, controlla i campi inseriti.");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Eliminare definitivamente "${product.name}"? L'azione non è reversibile.`)) {
      return;
    }
    const res = await fetch(`/api/admin/prodotti/${product.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Errore durante l'eliminazione");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Form */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-grass-deep">
            Gestione Catalogo
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
            Modifica Prodotto
          </h1>
          <p className="text-xs sm:text-sm text-ink-soft mt-1 font-mono">
            ID: {product.id}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink border border-line bg-white hover:bg-paper-warm transition-colors"
          >
            ← Annulla
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-soil-deep border border-soil-deep hover:bg-soil-deep hover:text-white transition-colors"
          >
            Elimina Prodotto
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-line p-6 sm:p-8">
        {/* Sezione Immagini */}
        <div className="space-y-4 pb-6 border-b border-line">
          <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
            Galleria Immagini
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {imagePreviews.map((src, i) => (
              <div key={i} className="w-24 h-24 relative border border-line group bg-paper-warm">
                <Image src={src} alt={`Anteprima ${i + 1}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-soil-deep text-white w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-700 transition-colors"
                >
                  ✕
                </button>
                {i === 0 && (
                  <span className="absolute bottom-0 inset-x-0 bg-ink/80 text-white text-[9px] font-semibold text-center py-0.5 uppercase tracking-wider">
                    Copertina
                  </span>
                )}
              </div>
            ))}
            <label className="w-24 h-24 bg-paper-warm border-2 border-dashed border-line flex flex-col items-center justify-center text-xs text-ink-soft cursor-pointer hover:border-grass-deep transition-colors text-center p-2">
              <span className="text-lg font-bold text-grass-deep">+</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider mt-1">Aggiungi</span>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
            </label>
          </div>
          <p className="text-xs text-ink-soft">
            La prima immagine della lista verrà usata come immagine principale nelle schede prodotto e in Homepage.
          </p>
        </div>

        {/* Dati Principali */}
        <div className="space-y-4 pb-6 border-b border-line">
          <span className="block text-xs font-bold text-grass-deep uppercase tracking-wider">
            Informazioni Principali
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Nome Prodotto *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-line px-3.5 py-2.5 text-sm text-ink focus:border-grass-deep outline-none transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Slug (URL univoco) *
              </label>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                required
                className="w-full border border-line px-3.5 py-2.5 text-sm text-ink focus:border-grass-deep outline-none transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Marchio *
              </label>
              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                required
                className="w-full border border-line px-3.5 py-2.5 text-sm text-ink focus:border-grass-deep outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Categoria *
              </label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full border border-line px-3.5 py-2.5 text-sm text-ink focus:border-grass-deep outline-none transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Titolo Breve / Sottotitolo (Opzionale)
              </label>
              <input
                name="shortTitle"
                value={form.shortTitle}
                onChange={handleChange}
                placeholder="es. Giacca ad alta visibilità certificata"
                className="w-full border border-line px-3.5 py-2.5 text-sm text-ink focus:border-grass-deep outline-none transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Descrizione Breve (Opzionale)
              </label>
              <textarea
                name="shortDescription"
                value={form.shortDescription}
                onChange={handleChange}
                rows={2}
                placeholder="Breve estratto visibile nella parte superiore della scheda prodotto..."
                className="w-full border border-line px-3.5 py-2.5 text-sm text-ink focus:border-grass-deep outline-none transition-colors resize-y"
              />
            </div>
          </div>
        </div>

        {/* Specifiche e Sconti */}
        <div className="space-y-4 pb-6 border-b border-line">
          <span className="block text-xs font-bold text-grass-deep uppercase tracking-wider">
            Specifiche Tecniche & Sconti
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Colonna d&apos;Acqua (mm)
              </label>
              <input
                type="number"
                name="waterColumn"
                value={form.waterColumn}
                onChange={handleChange}
                placeholder="es. 10000"
                className="w-full border border-line px-3.5 py-2.5 text-sm text-ink focus:border-grass-deep outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Temperatura Minima (°C)
              </label>
              <input
                type="number"
                name="minTemp"
                value={form.minTemp}
                onChange={handleChange}
                placeholder="es. -5"
                className="w-full border border-line px-3.5 py-2.5 text-sm text-ink focus:border-grass-deep outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Sconto (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                name="discountPercent"
                value={form.discountPercent}
                onChange={handleChange}
                placeholder="es. 15"
                className="w-full border border-line px-3.5 py-2.5 text-sm text-ink focus:border-grass-deep outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Sconto Valido Fino Al
              </label>
              <input
                type="date"
                name="discountUntil"
                value={form.discountUntil}
                onChange={handleChange}
                className="w-full border border-line px-3.5 py-2.5 text-sm text-ink focus:border-grass-deep outline-none transition-colors bg-white"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 pt-2 cursor-pointer">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={form.featured}
              onChange={handleChange}
              className="w-4 h-4 accent-grass-deep cursor-pointer"
            />
            <span className="text-xs font-bold text-ink uppercase tracking-wider">
              Mostra in prima pagina (In evidenza)
            </span>
          </label>
        </div>

        {/* Descrizione a blocchi */}
        <div className="space-y-4 pb-6 border-b border-line">
          <div className="flex items-center justify-between">
            <span className="block text-xs font-bold text-grass-deep uppercase tracking-wider">
              Descrizione Estesa (a blocchi)
            </span>
            <button
              type="button"
              onClick={addBlock}
              className="text-xs font-bold uppercase tracking-wider text-grass-deep hover:underline"
            >
              + Aggiungi Blocco
            </button>
          </div>

          <div className="space-y-3">
            {descriptionBlocks.map((block, i) => (
              <div key={i} className="border border-line p-4 bg-paper-warm relative space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-ink-soft">Blocco #{i + 1}</span>
                  {descriptionBlocks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBlock(i)}
                      className="text-xs font-bold text-ink-soft hover:text-soil-deep transition-colors"
                    >
                      Elimina
                    </button>
                  )}
                </div>
                <input
                  placeholder="Titolo del blocco (es. Impermeabilità e Traspirabilità)"
                  value={block.title}
                  onChange={(e) => handleBlockChange(i, "title", e.target.value)}
                  className="w-full border border-line px-3 py-2 text-sm font-semibold text-ink bg-white focus:border-grass-deep outline-none"
                />
                <textarea
                  placeholder="Contenuto e dettagli del blocco..."
                  value={block.text}
                  onChange={(e) => handleBlockChange(i, "text", e.target.value)}
                  rows={2}
                  className="w-full border border-line px-3 py-2 text-sm text-ink bg-white focus:border-grass-deep outline-none resize-y"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Varianti (Taglie e Prezzi) */}
        <div className="space-y-4 pb-6 border-b border-line">
          <div className="flex items-center justify-between">
            <span className="block text-xs font-bold text-grass-deep uppercase tracking-wider">
              Taglie e Inventario *
            </span>
            <button
              type="button"
              onClick={addVariant}
              className="text-xs font-bold uppercase tracking-wider text-grass-deep hover:underline"
            >
              + Aggiungi Taglia
            </button>
          </div>

          <div className="space-y-2">
            {variants.map((v, i) => (
              <div
                key={i}
                className="grid grid-cols-2 sm:grid-cols-[1fr_1.5fr_1.5fr_1fr_auto] gap-2 items-center bg-paper-warm p-3 border border-line"
              >
                <div className="min-w-0">
                  <label className="block sm:hidden text-[10px] uppercase font-bold text-ink-soft mb-1">
                    Taglia
                  </label>
                  <input
                    placeholder="Taglia (es. XL)"
                    value={v.size}
                    onChange={(e) => handleVariantChange(i, "size", e.target.value)}
                    required
                    className="w-full min-w-0 border border-line px-3 py-2 text-sm text-ink bg-white focus:border-grass-deep outline-none"
                  />
                </div>

                <div className="min-w-0">
                  <label className="block sm:hidden text-[10px] uppercase font-bold text-ink-soft mb-1">
                    SKU
                  </label>
                  <input
                    placeholder="SKU univoco"
                    value={v.sku}
                    onChange={(e) => handleVariantChange(i, "sku", e.target.value)}
                    required
                    className="w-full min-w-0 border border-line px-3 py-2 text-sm text-ink bg-white focus:border-grass-deep outline-none font-mono"
                  />
                </div>

                <div className="min-w-0">
                  <label className="block sm:hidden text-[10px] uppercase font-bold text-ink-soft mb-1">
                    Prezzo (cent)
                  </label>
                  <input
                    placeholder="Prezzo (in centesimi)"
                    value={v.priceCents}
                    onChange={(e) => handleVariantChange(i, "priceCents", e.target.value)}
                    required
                    className="w-full min-w-0 border border-line px-3 py-2 text-sm text-ink bg-white focus:border-grass-deep outline-none font-mono"
                  />
                </div>

                <div className="min-w-0">
                  <label className="block sm:hidden text-[10px] uppercase font-bold text-ink-soft mb-1">
                    Giacenza
                  </label>
                  <input
                    type="number"
                    placeholder="Giacenza"
                    value={v.stock}
                    onChange={(e) => handleVariantChange(i, "stock", e.target.value)}
                    required
                    className="w-full min-w-0 border border-line px-3 py-2 text-sm text-ink bg-white focus:border-grass-deep outline-none font-mono"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 flex justify-end sm:justify-center pt-1 sm:pt-0">
                  {variants.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="text-ink-soft hover:text-soil-deep font-bold text-sm px-2 py-1"
                      title="Elimina variante"
                    >
                      ✕
                    </button>
                  ) : (
                    <div className="w-6" />
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-ink-soft">
            Nota: 12900 centesimi equivalgono a € 129,00.
          </p>
        </div>

        {/* Pulsante Invio e Errori */}
        <div className="space-y-3 pt-2">
          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-grass hover:bg-grass-deep text-white font-bold text-sm py-4 transition-colors disabled:opacity-50 uppercase tracking-wider"
          >
            {uploading ? "Salvataggio e caricamento in corso..." : "Salva Modifiche Prodotto"}
          </button>

          {error && (
            <p className="text-xs text-soil-deep text-center font-bold pt-1">
              {error}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}