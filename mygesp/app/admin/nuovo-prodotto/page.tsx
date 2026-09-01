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
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      waterColumn: form.waterColumn ? Number(form.waterColumn) : null,
      minTemp: form.minTemp ? Number(form.minTemp) : null,
      featured: Boolean(featured),
      discountPercent: form.discountPercent ? Number(form.discountPercent) : 0,
      discountUntil: form.discountUntil ? new Date(form.discountUntil).toISOString() : null,
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
      router.push("/admin");
    } else {
      setError("Errore nel salvataggio, controlla i campi inseriti.");
    }
  };

  return (
    <main className="min-h-screen bg-paper py-12 px-4 sm:px-6 lg:px-8 selection:bg-grass selection:text-white">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-line/40 pb-8 mb-10">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-grass mb-2 block">
              Gestione Catalogo
            </span>
            <h1 className="text-3xl font-light text-ink tracking-tight mb-2">
              Nuovo Prodotto
            </h1>
            <p className="text-sm text-ink-soft font-light">
              Compila le informazioni necessarie per inserire un articolo nel catalogo.
            </p>
          </div>
          <Link
            href="/admin"
            className="text-[10px] font-semibold text-ink-soft hover:text-grass uppercase tracking-widest transition-colors mb-1"
          >
            &larr; Annulla
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* Sezione Immagini */}
          <section className="space-y-6">
            <h2 className="block text-[10px] font-semibold text-ink uppercase tracking-widest">
              Galleria Immagini
            </h2>
            <div className="flex flex-wrap items-start gap-4">
              {imagePreviews.map((src, i) => (
                <div key={i} className="w-28 h-32 relative border border-line/40 group bg-transparent">
                  <Image src={src} alt={`Anteprima ${i + 1}`} fill className="object-cover p-1" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-ink text-white w-6 h-6 flex items-center justify-center text-[10px] font-medium hover:bg-red-600 transition-colors z-10"
                  >
                    ✕
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 inset-x-1 bg-ink/90 text-white text-[9px] font-medium text-center py-1 uppercase tracking-widest backdrop-blur-sm">
                      Copertina
                    </span>
                  )}
                </div>
              ))}
              <label className="w-28 h-32 bg-transparent border border-dashed border-line/40 flex flex-col items-center justify-center cursor-pointer hover:border-grass hover:bg-line/5 transition-all group">
                <span className="text-2xl font-light text-ink-soft group-hover:text-grass mb-1">+</span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-ink-soft group-hover:text-grass">Aggiungi</span>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
              </label>
            </div>
            <p className="text-xs text-ink-soft font-light">
              La prima immagine caricata verrà impostata come copertina principale.
            </p>
          </section>

          <hr className="border-line/40" />

          {/* Dati Principali */}
          <section className="space-y-6">
            <h2 className="block text-[10px] font-semibold text-ink uppercase tracking-widest">
              Informazioni Principali
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-semibold text-ink uppercase tracking-widest mb-2">
                  Nome Prodotto *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="es. Giacca Impermeabile Uragan Tex"
                  className="w-full bg-transparent border border-line/40 px-4 py-3 text-sm text-ink focus:border-grass outline-none transition-colors placeholder:text-line placeholder:font-light"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-semibold text-ink uppercase tracking-widest mb-2">
                  Slug (URL univoco) *
                </label>
                <input
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  required
                  placeholder="es. giacca-uragan-tex"
                  className="w-full bg-transparent border border-line/40 px-4 py-3 text-sm text-ink focus:border-grass outline-none transition-colors placeholder:text-line placeholder:font-light font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-ink uppercase tracking-widest mb-2">
                  Marchio *
                </label>
                <input
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  required
                  placeholder="es. Beretta"
                  className="w-full bg-transparent border border-line/40 px-4 py-3 text-sm text-ink focus:border-grass outline-none transition-colors placeholder:text-line placeholder:font-light"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-ink uppercase tracking-widest mb-2">
                  Categoria *
                </label>
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  placeholder="es. Giacche"
                  className="w-full bg-transparent border border-line/40 px-4 py-3 text-sm text-ink focus:border-grass outline-none transition-colors placeholder:text-line placeholder:font-light"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-semibold text-ink uppercase tracking-widest mb-2">
                  Titolo Breve / Sottotitolo <span className="text-ink-soft">(Opzionale)</span>
                </label>
                <input
                  name="shortTitle"
                  value={form.shortTitle}
                  onChange={handleChange}
                  placeholder="es. Giacca ad alta visibilità certificata"
                  className="w-full bg-transparent border border-line/40 px-4 py-3 text-sm text-ink focus:border-grass outline-none transition-colors placeholder:text-line placeholder:font-light"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-semibold text-ink uppercase tracking-widest mb-2">
                  Descrizione Breve <span className="text-ink-soft">(Opzionale)</span>
                </label>
                <textarea
                  name="shortDescription"
                  value={form.shortDescription}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Breve estratto visibile nella parte superiore della scheda prodotto..."
                  className="w-full bg-transparent border border-line/40 px-4 py-3 text-sm text-ink focus:border-grass outline-none transition-colors placeholder:text-line placeholder:font-light resize-y"
                />
              </div>
            </div>
          </section>

          <hr className="border-line/40" />

          {/* Specifiche e Sconti */}
          <section className="space-y-6">
            <h2 className="block text-[10px] font-semibold text-ink uppercase tracking-widest">
              Specifiche Tecniche & Sconti
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-semibold text-ink uppercase tracking-widest mb-2">
                  Colonna d&apos;Acqua (mm)
                </label>
                <input
                  type="number"
                  name="waterColumn"
                  value={form.waterColumn}
                  onChange={handleChange}
                  placeholder="es. 10000"
                  className="w-full bg-transparent border border-line/40 px-4 py-3 text-sm text-ink focus:border-grass outline-none transition-colors placeholder:text-line placeholder:font-light"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-ink uppercase tracking-widest mb-2">
                  Temp. Minima (°C)
                </label>
                <input
                  type="number"
                  name="minTemp"
                  value={form.minTemp}
                  onChange={handleChange}
                  placeholder="es. -5"
                  className="w-full bg-transparent border border-line/40 px-4 py-3 text-sm text-ink focus:border-grass outline-none transition-colors placeholder:text-line placeholder:font-light"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-ink uppercase tracking-widest mb-2">
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
                  className="w-full bg-transparent border border-line/40 px-4 py-3 text-sm text-ink focus:border-grass outline-none transition-colors placeholder:text-line placeholder:font-light"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-ink uppercase tracking-widest mb-2">
                  Sconto Valido Fino Al
                </label>
                <input
                  type="date"
                  name="discountUntil"
                  value={form.discountUntil}
                  onChange={handleChange}
                  className="w-full bg-transparent border border-line/40 px-4 py-3 text-sm text-ink focus:border-grass outline-none transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="inline-flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="peer appearance-none w-5 h-5 border border-line/40 bg-transparent checked:bg-grass checked:border-grass transition-colors cursor-pointer"
                  />
                  <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-[10px] font-semibold text-ink uppercase tracking-widest group-hover:text-grass transition-colors">
                  Metti in evidenza in Homepage
                </span>
              </label>
            </div>
          </section>

          <hr className="border-line/40" />

          {/* Descrizione a blocchi */}
          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="block text-[10px] font-semibold text-ink uppercase tracking-widest">
                Descrizione Estesa (a blocchi)
              </h2>
              <button
                type="button"
                onClick={addBlock}
                className="text-[10px] font-semibold uppercase tracking-widest text-ink hover:text-grass transition-colors"
              >
                + Aggiungi Blocco
              </button>
            </div>

            <div className="space-y-4">
              {descriptionBlocks.map((block, i) => (
                <div key={i} className="border border-line/40 p-6 relative space-y-4 bg-line/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold tracking-widest text-ink-soft">Blocco {i + 1}</span>
                    {descriptionBlocks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBlock(i)}
                        className="text-[10px] font-semibold text-ink-soft hover:text-red-600 uppercase tracking-widest transition-colors"
                      >
                        Elimina
                      </button>
                    )}
                  </div>
                  <input
                    placeholder="Titolo del blocco (es. Impermeabilità e Traspirabilità)"
                    value={block.title}
                    onChange={(e) => handleBlockChange(i, "title", e.target.value)}
                    className="w-full bg-transparent border-b border-line/40 pb-2 text-sm font-semibold text-ink focus:border-grass outline-none transition-colors placeholder:text-line placeholder:font-light"
                  />
                  <textarea
                    placeholder="Contenuto e dettagli del blocco..."
                    value={block.text}
                    onChange={(e) => handleBlockChange(i, "text", e.target.value)}
                    rows={3}
                    className="w-full bg-transparent border border-line/40 px-4 py-3 text-sm text-ink focus:border-grass outline-none transition-colors placeholder:text-line placeholder:font-light resize-y"
                  />
                </div>
              ))}
            </div>
          </section>

          <hr className="border-line/40" />

          {/* Varianti (Taglie e Prezzi) */}
          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="block text-[10px] font-semibold text-ink uppercase tracking-widest">
                Taglie e Inventario *
              </h2>
              <button
                type="button"
                onClick={addVariant}
                className="text-[10px] font-semibold uppercase tracking-widest text-ink hover:text-grass transition-colors"
              >
                + Aggiungi Taglia
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((v, i) => (
                <div
                  key={i}
                  className="grid grid-cols-2 md:grid-cols-[1fr_1.5fr_1.5fr_1fr_auto] gap-4 items-end border border-line/40 p-4 bg-transparent"
                >
                  <div>
                    <label className="block md:hidden text-[9px] uppercase font-semibold tracking-widest text-ink-soft mb-2">Taglia</label>
                    <input
                      placeholder="Taglia (es. XL)"
                      value={v.size}
                      onChange={(e) => handleVariantChange(i, "size", e.target.value)}
                      required
                      className="w-full bg-transparent border-b border-line/40 pb-2 text-sm text-ink focus:border-grass outline-none transition-colors placeholder:text-line"
                    />
                  </div>

                  <div>
                    <label className="block md:hidden text-[9px] uppercase font-semibold tracking-widest text-ink-soft mb-2">SKU</label>
                    <input
                      placeholder="SKU univoco"
                      value={v.sku}
                      onChange={(e) => handleVariantChange(i, "sku", e.target.value)}
                      required
                      className="w-full bg-transparent border-b border-line/40 pb-2 text-sm text-ink focus:border-grass outline-none transition-colors placeholder:text-line font-mono"
                    />
                  </div>

                  <div>
                    <label className="block md:hidden text-[9px] uppercase font-semibold tracking-widest text-ink-soft mb-2">Prezzo (cent)</label>
                    <input
                      placeholder="es. 12900 (€129,00)"
                      value={v.priceCents}
                      onChange={(e) => handleVariantChange(i, "priceCents", e.target.value)}
                      required
                      className="w-full bg-transparent border-b border-line/40 pb-2 text-sm text-ink focus:border-grass outline-none transition-colors placeholder:text-line font-mono"
                    />
                  </div>

                  <div>
                    <label className="block md:hidden text-[9px] uppercase font-semibold tracking-widest text-ink-soft mb-2">Giacenza</label>
                    <input
                      type="number"
                      placeholder="Stock"
                      value={v.stock}
                      onChange={(e) => handleVariantChange(i, "stock", e.target.value)}
                      required
                      className="w-full bg-transparent border-b border-line/40 pb-2 text-sm text-ink focus:border-grass outline-none transition-colors placeholder:text-line font-mono"
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1 flex justify-end md:justify-center pb-2">
                    {variants.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeVariant(i)}
                        className="text-ink-soft hover:text-red-600 font-medium text-xs px-2 py-1 transition-colors"
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
            <p className="text-xs text-ink-soft font-light">
              Nota: I prezzi vanno inseriti in <strong>centesimi</strong>. Es: 12900 = € 129,00.
            </p>
          </section>

          {/* Pulsante Invio e Errori */}
          <div className="pt-6">
            {error && (
              <div className="mb-6 p-4 text-[10px] font-medium text-center uppercase tracking-widest bg-line/5 text-red-600 border border-red-200">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-ink hover:bg-grass text-white text-[10px] font-medium uppercase tracking-widest py-4 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {uploading ? "Salvataggio in corso..." : "Salva e Pubblica Prodotto"}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}