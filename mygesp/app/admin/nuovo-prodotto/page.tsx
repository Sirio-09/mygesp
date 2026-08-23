"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function NuovoProdotto() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    shortTitle: "",
    shortDescription: "",
    brand: "",
    category: "",
    waterColumn: "",
    minTemp: "",
    discountPercent: "",
    discountUntil: "",
  });
  const [featured, setFeatured] = useState(false);
  const [descriptionBlocks, setDescriptionBlocks] = useState([{ title: "", text: "" }]);
  const [variants, setVariants] = useState([{ size: "", sku: "", priceCents: "", stock: "" }]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

    const payload = {
      ...form,
      shortTitle: form.shortTitle.trim() ? form.shortTitle.trim() : null,
      shortDescription: form.shortDescription.trim() ? form.shortDescription.trim() : null,
      images: uploadedUrls,
      variants,
      descriptionBlocks,
      featured,
    };

    const res = await fetch("/api/admin/prodotti", {
      method: "POST",
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

  return (
    <main className="min-h-[calc(100vh-80px)] bg-paper-warm py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-grass-deep">
              Gestione Catalogo
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
              Nuovo Prodotto
            </h1>
            <p className="text-xs sm:text-sm text-ink-soft mt-1">
              Compila le informazioni necessarie per inserire un articolo nel catalogo.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink border border-line bg-white hover:bg-paper-warm transition-colors w-fit"
          >
            ← Annulla
          </Link>
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
                  placeholder="es. Giacca Impermeabile Uragan Tex"
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
                  placeholder="es. giacca-uragan-tex"
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
                  placeholder="es. Beretta"
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
                  placeholder="es. Giacche"
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
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-grass-deep cursor-pointer"
              />
              <span className="text-xs font-bold text-ink uppercase tracking-wider">
                Metti in evidenza in Homepage
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
                <div key={i} className="grid grid-cols-2 sm:grid-cols-[1fr_1.5fr_1.5fr_1fr_auto] gap-2 items-center bg-paper-warm p-2 border border-line">
                  <input
                    placeholder="Taglia (es. XL)"
                    value={v.size}
                    onChange={(e) => handleVariantChange(i, "size", e.target.value)}
                    required
                    className="border border-line px-3 py-2 text-sm text-ink bg-white focus:border-grass-deep outline-none"
                  />
                  <input
                    placeholder="SKU univoco"
                    value={v.sku}
                    onChange={(e) => handleVariantChange(i, "sku", e.target.value)}
                    required
                    className="border border-line px-3 py-2 text-sm text-ink bg-white focus:border-grass-deep outline-none font-mono"
                  />
                  <input
                    placeholder="Prezzo (in centesimi, es. 12900)"
                    value={v.priceCents}
                    onChange={(e) => handleVariantChange(i, "priceCents", e.target.value)}
                    required
                    className="border border-line px-3 py-2 text-sm text-ink bg-white focus:border-grass-deep outline-none font-mono"
                  />
                  <input
                    type="number"
                    placeholder="Giacenza"
                    value={v.stock}
                    onChange={(e) => handleVariantChange(i, "stock", e.target.value)}
                    required
                    className="border border-line px-3 py-2 text-sm text-ink bg-white focus:border-grass-deep outline-none"
                  />
                  {variants.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="text-ink-soft hover:text-soil-deep font-bold text-sm px-2"
                    >
                      ✕
                    </button>
                  ) : (
                    <div className="w-6" />
                  )}
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
              {uploading ? "Salvataggio e caricamento in corso..." : "Salva e Pubblica Prodotto"}
            </button>

            {error && (
              <p className="text-xs text-soil-deep text-center font-bold pt-1">
                {error}
              </p>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}