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

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  category: string;
  waterColumn: number | null;
  minTemp: number | null;
  images: string[];
  variants: Variant[];
};

export default function EditProductForm({ product }: { product: Product }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: product.name,
    slug: product.slug,
    description: product.description,
    brand: product.brand,
    category: product.category,
    waterColumn: product.waterColumn?.toString() ?? "",
    minTemp: product.minTemp?.toString() ?? "",
  });
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
    setForm({ ...form, [e.target.name]: e.target.value });
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

    const res = await fetch(`/api/admin/prodotti/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, images: allImages, variants }),
    });

    setUploading(false);

    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Errore nel salvataggio, controlla i campi");
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
    <main className="max-w-[720px] mx-auto px-4 sm:px-8 py-12">
      <Link href="/admin" className="text-sm text-ink-soft hover:text-grass-deep mb-6 inline-block">
        ← Torna al catalogo
      </Link>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <h1 className="text-ink font-extrabold text-3xl">
          Modifica prodotto
        </h1>
        <button
          type="button"
          onClick={handleDelete}
          className="text-soil-deep hover:text-white text-sm border border-soil-deep hover:bg-soil-deep px-3 py-1.5 transition-colors w-fit"
        >
          Elimina prodotto
        </button>
      </div>
      <p className="text-ink-soft text-sm mb-8">{product.name}</p>

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
              className="w-full border border-line px-3 py-2 focus:border-grass-deep outline-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-ink mb-1">Descrizione</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={3}
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
          {uploading ? "Salvataggio in corso..." : "Salva modifiche"}
        </button>
        {error && <p className="text-soil-deep text-sm text-center">{error}</p>}
      </form>
    </main>
  );
}