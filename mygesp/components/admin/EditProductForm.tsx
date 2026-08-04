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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product.images[0] ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
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

    let imageUrl = product.images[0] ?? "";
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setError("Errore durante il caricamento dell'immagine");
        setUploading(false);
        return;
      }
      imageUrl = uploadData.url;
    }

    const res = await fetch(`/api/admin/prodotti/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, images: imageUrl ? [imageUrl] : [], variants }),
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
    <main className="max-w-[720px] mx-auto px-8 py-12">
      <Link href="/admin" className="text-sm text-mud hover:text-rust mb-6 inline-block">
        ← Torna al catalogo
      </Link>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-3xl uppercase text-loden-deep tracking-wide">
          Modifica prodotto
        </h1>
        <button
          type="button"
          onClick={handleDelete}
          className="text-rust hover:text-rust-deep text-sm border border-rust hover:bg-rust hover:text-white px-3 py-1.5 transition-colors"
        >
          Elimina prodotto
        </button>
      </div>
      <p className="text-slate text-sm mb-8">{product.name}</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-loden-deep mb-2">Immagine prodotto</label>
          <div className="flex items-center gap-4">
            <label className="w-32 h-32 bg-canvas border-2 border-dashed border-mud flex items-center justify-center text-xs text-mud text-center cursor-pointer hover:border-rust transition-colors overflow-hidden relative">
              {imagePreview ? (
                <Image src={imagePreview} alt="Anteprima" fill className="object-cover" />
              ) : (
                <span>Clicca per caricare</span>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-loden-deep mb-1">Nome prodotto</label>
            <input name="name" value={form.name} onChange={handleChange} required
              className="w-full border border-mud px-3 py-2 focus:border-rust outline-none" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-loden-deep mb-1">Slug (URL)</label>
            <input name="slug" value={form.slug} onChange={handleChange} required
              className="w-full border border-mud px-3 py-2 focus:border-rust outline-none" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-loden-deep mb-1">Descrizione</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={3}
              className="w-full border border-mud px-3 py-2 focus:border-rust outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-loden-deep mb-1">Marchio</label>
            <input name="brand" value={form.brand} onChange={handleChange} required
              className="w-full border border-mud px-3 py-2 focus:border-rust outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-loden-deep mb-1">Categoria</label>
            <input name="category" value={form.category} onChange={handleChange} required
              className="w-full border border-mud px-3 py-2 focus:border-rust outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-loden-deep mb-1">Colonna d&apos;acqua (mm)</label>
            <input name="waterColumn" value={form.waterColumn} onChange={handleChange}
              className="w-full border border-mud px-3 py-2 focus:border-rust outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-loden-deep mb-1">Temperatura minima (°C)</label>
            <input name="minTemp" value={form.minTemp} onChange={handleChange}
              className="w-full border border-mud px-3 py-2 focus:border-rust outline-none" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-loden-deep">Taglie e prezzi</label>
            <button type="button" onClick={addVariant} className="text-sm text-rust hover:underline">
              + Aggiungi taglia
            </button>
          </div>
          <div className="space-y-2">
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-center">
                <input placeholder="Taglia" value={v.size} onChange={(e) => handleVariantChange(i, "size", e.target.value)} required
                  className="border border-mud px-2 py-1.5 text-sm focus:border-rust outline-none" />
                <input placeholder="SKU" value={v.sku} onChange={(e) => handleVariantChange(i, "sku", e.target.value)} required
                  className="border border-mud px-2 py-1.5 text-sm focus:border-rust outline-none" />
                <input placeholder="Prezzo (centesimi)" value={v.priceCents} onChange={(e) => handleVariantChange(i, "priceCents", e.target.value)} required
                  className="border border-mud px-2 py-1.5 text-sm focus:border-rust outline-none" />
                <input placeholder="Quantità" value={v.stock} onChange={(e) => handleVariantChange(i, "stock", e.target.value)} required
                  className="border border-mud px-2 py-1.5 text-sm focus:border-rust outline-none" />
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(i)} className="text-mud hover:text-rust text-sm">
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={uploading}
          className="bg-rust hover:bg-rust-deep text-white font-display uppercase tracking-wide text-[15px] font-semibold py-4 px-8 w-full disabled:opacity-50">
          {uploading ? "Salvataggio in corso..." : "Salva modifiche"}
        </button>
        {error && <p className="text-rust text-sm text-center">{error}</p>}
      </form>
    </main>
  );
}