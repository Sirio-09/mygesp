"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AdminAlert from "@/components/admin/ui/AdminAlert";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminModal from "@/components/admin/ui/AdminModal";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import AdminSection from "@/components/admin/ui/AdminSection";
import { ArrowUpRight } from "@/components/admin/ui/icons";
import AdminDescriptionBlocks from "@/components/admin/product/AdminDescriptionBlocks";
import AdminImagePicker from "@/components/admin/product/AdminImagePicker";
import AdminProductFields from "@/components/admin/product/AdminProductFields";
import AdminVariantRows from "@/components/admin/product/AdminVariantRows";
import type {
  DescriptionBlockInput,
  ProductFieldChangeEvent,
  ProductFormState,
  VariantInput,
} from "@/components/admin/product/types";

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

type ImageEntry = {
  id: string;
  src: string;
  file: File | null;
};

export default function EditProductForm({ product }: { product: Product }) {
  const router = useRouter();

  const [form, setForm] = useState<ProductFormState>({
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

  const [descriptionBlocks, setDescriptionBlocks] = useState<
    DescriptionBlockInput[]
  >(
    Array.isArray(product.descriptionBlocks) &&
      product.descriptionBlocks.length > 0
      ? (product.descriptionBlocks as DescriptionBlockInput[])
      : [{ title: "", text: "" }]
  );

  const [variants, setVariants] = useState<VariantInput[]>(
    product.variants.map((v) => ({
      size: v.size,
      sku: v.sku,
      priceCents: v.priceCents.toString(),
      stock: v.stock.toString(),
    }))
  );

  // Le immagini già salvate e i file nuovi convivono nella stessa lista:
  // così l'ordine (e quindi la copertina) resta quello che si vede.
  const [images, setImages] = useState<ImageEntry[]>(
    product.images.map((src, index) => ({
      id: `existing-${index}`,
      src,
      file: null,
    }))
  );

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleChange = (e: ProductFieldChangeEvent) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlockChange = (
    index: number,
    field: "title" | "text",
    value: string
  ) => {
    setDescriptionBlocks((prev) =>
      prev.map((block, i) => (i === index ? { ...block, [field]: value } : block))
    );
  };

  const addBlock = () => {
    setDescriptionBlocks((prev) => [...prev, { title: "", text: "" }]);
  };

  const removeBlock = (index: number) => {
    setDescriptionBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImages = (files: File[]) => {
    const stamp = Date.now();

    setImages((prev) => [
      ...prev,
      ...files.map((file, index) => ({
        id: `new-${stamp}-${index}`,
        src: URL.createObjectURL(file),
        file,
      })),
    ]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (
    index: number,
    field: keyof VariantInput,
    value: string
  ) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    );
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { size: "", sku: "", priceCents: "", stock: "" },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUploading(true);

    const uploadedById = new Map<string, string>();

    for (const entry of images) {
      if (!entry.file) continue;

      const formData = new FormData();
      formData.append("file", entry.file);

      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        setError("Errore durante il caricamento di un'immagine");
        setUploading(false);
        return;
      }

      const uploadData = await uploadRes.json();
      uploadedById.set(entry.id, uploadData.url as string);
    }

    const allImages = images
      .map((entry) =>
        entry.file ? uploadedById.get(entry.id) ?? "" : entry.src
      )
      .filter((src) => src !== "");

    const payload = {
      ...form,
      shortTitle: form.shortTitle.trim() ? form.shortTitle.trim() : null,
      shortDescription: form.shortDescription.trim()
        ? form.shortDescription.trim()
        : null,
      waterColumn: form.waterColumn ? Number(form.waterColumn) : null,
      minTemp: form.minTemp ? Number(form.minTemp) : null,
      featured: Boolean(form.featured),
      discountPercent: form.discountPercent
        ? Number(form.discountPercent)
        : 0,
      discountUntil: form.discountUntil
        ? new Date(form.discountUntil).toISOString()
        : null,
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
      toast.success("Modifiche salvate");
      router.push("/admin");
      return;
    }

    const data = await res.json().catch(() => null);
    setError(
      data?.error || "Errore nel salvataggio, controlla i campi inseriti."
    );
  };

  const handleDelete = async () => {
    setConfirmDelete(false);

    const res = await fetch(`/api/admin/prodotti/${product.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("Prodotto eliminato");
      router.push("/admin");
      return;
    }

    const data = await res.json().catch(() => null);
    setError(data?.error || "Errore durante l'eliminazione");
    toast.error("Eliminazione non riuscita");
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalogo"
        title="Modifica prodotto"
        description={`Riferimento interno: ${product.id}`}
        actions={
          <>
            <AdminButton variant="danger" onClick={() => setConfirmDelete(true)}>
              Elimina
            </AdminButton>
            <AdminButton
              href={`/prodotto/${product.slug}`}
              variant="secondary"
            >
              Vedi sul sito
              <ArrowUpRight className="h-3.5 w-3.5" />
            </AdminButton>
          </>
        }
      />

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <AdminSection
          label="Galleria immagini"
          description="La prima immagine è la copertina."
        >
          <AdminImagePicker
            previews={images.map((entry) => entry.src)}
            onFiles={handleImages}
            onRemove={removeImage}
            note="Trascina o seleziona nuove foto: l'ordine di questa lista è l'ordine in scheda."
          />
        </AdminSection>

        <AdminProductFields form={form} onChange={handleChange} />

        <AdminSection
          label="Descrizione estesa"
          description="Blocchi titolo + testo mostrati nella scheda prodotto."
        >
          <AdminDescriptionBlocks
            blocks={descriptionBlocks}
            onChange={handleBlockChange}
            onAdd={addBlock}
            onRemove={removeBlock}
          />
        </AdminSection>

        <AdminSection
          label="Taglie e inventario"
          description="Una riga per variante: taglia, SKU, prezzo e giacenza."
        >
          <AdminVariantRows
            variants={variants}
            onChange={handleVariantChange}
            onAdd={addVariant}
            onRemove={removeVariant}
          />
        </AdminSection>

        <div className="sticky bottom-0 z-30 -mx-4 border-t border-line bg-paper/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-light leading-relaxed text-ink-soft">
              Controlla i campi con * prima di salvare.
            </p>
            <div className="flex items-center gap-4">
              <AdminButton href="/admin" variant="ghost">
                Annulla
              </AdminButton>
              <AdminButton
                type="submit"
                disabled={uploading}
                className="w-full sm:w-auto"
              >
                {uploading ? "Salvataggio..." : "Salva modifiche"}
              </AdminButton>
            </div>
          </div>

          {error && (
            <AdminAlert className="mt-4" tone="danger">
              {error}
            </AdminAlert>
          )}
        </div>
      </form>

      <AdminModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Eliminare il prodotto?"
        description={`"${product.name}" verrà rimosso definitivamente dal catalogo.`}
        footer={
          <>
            <AdminButton
              variant="secondary"
              onClick={() => setConfirmDelete(false)}
            >
              Annulla
            </AdminButton>
            <AdminButton variant="destructive" onClick={handleDelete}>
              Elimina prodotto
            </AdminButton>
          </>
        }
      />
    </>
  );
}


