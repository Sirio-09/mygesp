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

  // Classi CSS ricorrenti per mantenere coerenza e pulizia
  const inputClass = "w-full bg-transparent border border-line/40 px-4 py-3 text-sm font-light text-ink focus:border-grass outline-none transition-colors placeholder:text-line placeholder:font-light";
  const labelClass = "block text-[10px] uppercase font-semibold tracking-widest text-ink mb-2";

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      
      {/* Header Form */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-line/40 pb-8">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-grass mb-2 block">
            Gestione Catalogo
          </span>
          <h1 className="text-3xl font-light text-ink tracking-tight mb-2">
            Modifica Prodotto
          </h1>
          <p className="text-xs text-ink-soft font-mono font-light uppercase tracking-widest">
            Ref: {product.id}
          </p>
        </div>
        <div className="flex items-center gap-6 mb-1">
          <button
            type="button"
            onClick={handleDelete}
            className="text-[10px] font-semibold text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors"
          >
            Elimina Prodotto
          </button>
          <span className="text-line/40">|</span>
          <Link
            href="/admin"
            className="text-[10px] font-semibold text-ink-soft hover:text-ink uppercase tracking-widest transition-colors"
          >
            &larr; Annulla
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Sezione Immagini */}
        <div className="bg-transparent border border-line/40 p-8 space-y-6">
          <div className="border-b border-line/40 pb-4">
            <span className="text-[10px] font-semibold text-ink uppercase tracking-widest block">
              Galleria Immagini
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {imagePreviews.map((src, i) => (
              <div key={i} className="w-24 h-24 relative border border-line/40 group overflow-hidden bg-transparent">
                <Image src={src} alt={`Anteprima ${i + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-0 right-0 bg-ink text-white w-6 h-6 flex items-center justify-center text-[10px] font-medium opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
                  title="Rimuovi immagine"
                >
                  ✕
                </button>
                {i === 0 && (
                  <span className="absolute bottom-0 inset-x-0 bg-ink/90 text-white text-[8px] font-semibold text-center py-1 uppercase tracking-widest backdrop-blur-sm">
                    Copertina
                  </span>
                )}
              </div>
            ))}
            
            <label className="w-24 h-24 border border-line/40 flex flex-col items-center justify-center cursor-pointer hover:border-grass transition-colors group">
              <span className="text-xl font-light text-ink-soft group-hover:text-grass transition-colors mb-1">+</span>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-ink-soft group-hover:text-grass transition-colors">Carica</span>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
            </label>
          </div>
          <p className="text-xs text-ink-soft font-light">
            La prima immagine sarà usata come copertina nella vetrina e nei risultati di ricerca.
          </p>
        </div>

        {/* Dati Principali */}
        <div className="bg-transparent border border-line/40 p-8 space-y-6">
          <div className="border-b border-line/40 pb-4 mb-6">
            <span className="text-[10px] font-semibold text-ink uppercase tracking-widest block">
              Informazioni Principali
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className={labelClass}>Nome Prodotto *</label>
              <input name="name" value={form.name} onChange={handleChange} required className={inputClass} />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Slug (URL univoco) *</label>
              <input name="slug" value={form.slug} onChange={handleChange} required className={`${inputClass} font-mono text-xs`} />
            </div>

            <div>
              <label className={labelClass}>Marchio *</label>
              <input name="brand" value={form.brand} onChange={handleChange} required className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Categoria *</label>
              <input name="category" value={form.category} onChange={handleChange} required className={inputClass} />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Titolo Breve / Sottotitolo (Opzionale)</label>
              <input name="shortTitle" value={form.shortTitle} onChange={handleChange} placeholder="es. Giacca ad alta visibilità certificata" className={inputClass} />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Descrizione Breve (Opzionale)</label>
              <textarea name="shortDescription" value={form.shortDescription} onChange={handleChange} rows={3} placeholder="Breve estratto visibile nella parte superiore della scheda prodotto..." className={`${inputClass} resize-y`} />
            </div>
          </div>
        </div>

        {/* Specifiche e Sconti */}
        <div className="bg-transparent border border-line/40 p-8 space-y-6">
          <div className="border-b border-line/40 pb-4 mb-6">
            <span className="text-[10px] font-semibold text-ink uppercase tracking-widest block">
              Specifiche Tecniche & Sconti
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Colonna d&apos;Acqua (mm)</label>
              <input type="number" name="waterColumn" value={form.waterColumn} onChange={handleChange} placeholder="es. 10000" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Temperatura Minima (°C)</label>
              <input type="number" name="minTemp" value={form.minTemp} onChange={handleChange} placeholder="es. -5" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Sconto (%)</label>
              <input type="number" min="0" max="100" name="discountPercent" value={form.discountPercent} onChange={handleChange} placeholder="es. 15" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Sconto Valido Fino Al</label>
              <input type="date" name="discountUntil" value={form.discountUntil} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="pt-4 border-t border-line/40">
            <label className="flex items-center gap-4 cursor-pointer group w-max">
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="w-4 h-4 accent-grass cursor-pointer" />
              <span className="text-[10px] font-semibold text-ink uppercase tracking-widest group-hover:text-grass transition-colors">
                Mostra in prima pagina (In evidenza)
              </span>
            </label>
          </div>
        </div>

        {/* Descrizione a blocchi */}
        <div className="bg-transparent border border-line/40 p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-line/40 pb-4 mb-6">
            <span className="text-[10px] font-semibold text-ink uppercase tracking-widest block">
              Descrizione Estesa
            </span>
            <button type="button" onClick={addBlock} className="text-[10px] font-semibold uppercase tracking-widest text-ink-soft hover:text-ink transition-colors">
              + Aggiungi Blocco
            </button>
          </div>

          <div className="space-y-4">
            {descriptionBlocks.map((block, i) => (
              <div key={i} className="border border-line/40 p-6 space-y-4 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-grass">Blocco {i + 1}</span>
                  {descriptionBlocks.length > 1 && (
                    <button type="button" onClick={() => removeBlock(i)} className="text-[9px] font-semibold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors">
                      Elimina
                    </button>
                  )}
                </div>
                <div>
                  <input placeholder="Titolo del blocco (es. Impermeabilità)" value={block.title} onChange={(e) => handleBlockChange(i, "title", e.target.value)} className={`${inputClass} mb-4`} />
                  <textarea placeholder="Contenuto e dettagli del blocco..." value={block.text} onChange={(e) => handleBlockChange(i, "text", e.target.value)} rows={3} className={`${inputClass} resize-y`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Varianti (Taglie e Prezzi) */}
        <div className="bg-transparent border border-line/40 p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-line/40 pb-4 mb-6">
            <span className="text-[10px] font-semibold text-ink uppercase tracking-widest block">
              Taglie & Inventario
            </span>
            <button type="button" onClick={addVariant} className="text-[10px] font-semibold uppercase tracking-widest text-ink-soft hover:text-ink transition-colors">
              + Aggiungi Variante
            </button>
          </div>

          <div className="space-y-4">
            {variants.map((v, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-4 items-end border border-line/40 p-6 relative">
                <div className="w-full">
                  <label className={labelClass}>Taglia *</label>
                  <input placeholder="es. XL" value={v.size} onChange={(e) => handleVariantChange(i, "size", e.target.value)} required className={inputClass} />
                </div>
                <div className="w-full">
                  <label className={labelClass}>SKU *</label>
                  <input placeholder="Codice Univoco" value={v.sku} onChange={(e) => handleVariantChange(i, "sku", e.target.value)} required className={`${inputClass} font-mono text-xs`} />
                </div>
                <div className="w-full">
                  <label className={labelClass}>Prezzo (Cent) *</label>
                  <input type="number" placeholder="es. 12900" value={v.priceCents} onChange={(e) => handleVariantChange(i, "priceCents", e.target.value)} required className={`${inputClass} font-mono text-xs`} />
                </div>
                <div className="w-full">
                  <label className={labelClass}>Giacenza *</label>
                  <input type="number" placeholder="Qtà" value={v.stock} onChange={(e) => handleVariantChange(i, "stock", e.target.value)} required className={`${inputClass} font-mono text-xs`} />
                </div>
                <div className="pb-3 sm:pl-2">
                  {variants.length > 1 ? (
                    <button type="button" onClick={() => removeVariant(i)} className="text-[12px] font-medium text-ink-soft hover:text-red-500 transition-colors" title="Rimuovi variante">
                      ✕
                    </button>
                  ) : (
                    <div className="w-3" /> // Placeholder per mantenere allineamento
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-soft font-light">
            Nota: I prezzi sono espressi in centesimi (es. 12900 = € 129,00).
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
          <p className="text-xs text-ink-soft font-light">
            Ricontrolla i campi obbligatori contrassegnati da asterisco prima di procedere.
          </p>
          <div className="w-full sm:w-auto flex flex-col items-center">
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-ink hover:bg-grass text-white text-[10px] font-medium uppercase tracking-widest py-4 px-10 transition-colors disabled:opacity-30"
            >
              {uploading ? "Salvataggio..." : "Salva Modifiche"}
            </button>
            {error && (
              <p className="text-[10px] font-semibold text-red-500 uppercase tracking-widest mt-4">
                {error}
              </p>
            )}
          </div>
        </div>

      </form>
    </div>
  );
}