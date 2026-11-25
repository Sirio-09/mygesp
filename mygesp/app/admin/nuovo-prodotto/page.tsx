"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AdminAlert from "@/components/admin/ui/AdminAlert";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import AdminSection from "@/components/admin/ui/AdminSection";
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

const emptyForm: ProductFormState = {
  name: "",
  slug: "",
  shortTitle: "",
  shortDescription: "",
  brand: "",
  category: "",
  waterColumn: "",
  minTemp: "",
  featured: false,
  discountPercent: "",
  discountUntil: "",
};

export default function NuovoProdotto() {
  const router = useRouter();

  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [descriptionBlocks, setDescriptionBlocks] = useState<
    DescriptionBlockInput[]
  >([{ title: "", text: "" }]);
  const [variants, setVariants] = useState<VariantInput[]>([
    { size: "", sku: "", priceCents: "", stock: "" },
  ]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

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
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
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

    const uploadedUrls: string[] = [];

    for (const file of imageFiles) {
      const formData = new FormData();
      formData.append("file", file);

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
      uploadedUrls.push(uploadData.url);
    }

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
      images: uploadedUrls,
      variants,
      descriptionBlocks,
    };

    const res = await fetch("/api/admin/prodotti", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setUploading(false);

    if (res.ok) {
      toast.success("Prodotto pubblicato");
      router.push("/admin");
      return;
    }

    const data = await res.json().catch(() => null);
    setError(
      data?.error || "Errore nel salvataggio, controlla i campi inseriti."
    );
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalogo"
        title="Nuovo prodotto"
        description="Inserisci immagini, testi, specifiche e taglie. Il prodotto va online appena salvi."
        actions={
          <AdminButton href="/admin" variant="secondary">
            Annulla
          </AdminButton>
        }
      />

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <AdminSection
          label="Galleria immagini"
          description="La prima immagine è la copertina."
        >
          <AdminImagePicker
            previews={imagePreviews}
            onFiles={handleImages}
            onRemove={removeImage}
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
              I campi con * sono obbligatori. I prezzi sono in centesimi.
            </p>
            <AdminButton
              type="submit"
              disabled={uploading}
              className="w-full sm:w-auto"
            >
              {uploading ? "Salvataggio..." : "Salva e pubblica"}
            </AdminButton>
          </div>

          {error && (
            <AdminAlert className="mt-4" tone="danger">
              {error}
            </AdminAlert>
          )}
        </div>
      </form>
    </>
  );
}

