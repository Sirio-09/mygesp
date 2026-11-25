"use client";

import AdminField from "../ui/AdminField";
import AdminSection from "../ui/AdminSection";
import { inputClass, textareaClass } from "../ui/field-styles";
import type { ProductFieldChangeEvent, ProductFormState } from "./types";

/**
 * Campi testuali del prodotto (anagrafica + specifiche + sconto + vetrina).
 * Usato sia in creazione sia in modifica: le due pagine non possono più
 * divergere per label, placeholder o tipi di input.
 */

export default function AdminProductFields({
  form,
  onChange,
}: {
  form: ProductFormState;
  onChange: (event: ProductFieldChangeEvent) => void;
}) {
  return (
    <div className="space-y-6">
      <AdminSection
        label="Informazioni principali"
        description="Testi e riferimenti mostrati nella scheda pubblica."
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <AdminField className="sm:col-span-2" label="Nome prodotto" required>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              required
              placeholder="es. Giacca impermeabile Uragan Tex"
              className={inputClass}
            />
          </AdminField>

          <AdminField
            className="sm:col-span-2"
            label="Slug (URL univoco)"
            required
            hint="Solo minuscole e trattini: identifica la scheda sul sito."
          >
            <input
              name="slug"
              value={form.slug}
              onChange={onChange}
              required
              placeholder="es. giacca-uragan-tex"
              className={`${inputClass} font-mono`}
            />
          </AdminField>

          <AdminField label="Marchio" required>
            <input
              name="brand"
              value={form.brand}
              onChange={onChange}
              required
              placeholder="es. Beretta"
              className={inputClass}
            />
          </AdminField>

          <AdminField label="Categoria" required>
            <select
              name="category"
              value={form.category}
              onChange={onChange}
              required
              className={inputClass}
            >
              <option value="" disabled>Seleziona una categoria</option>
              <option value="abbigliamento">Abbigliamento</option>
              <option value="stivali">Stivali</option>
              <option value="attrezzature">Attrezzature</option>
            </select>
          </AdminField>

          <AdminField
            className="sm:col-span-2"
            label="Titolo breve (opzionale)"
            hint="Sottotitolo mostrato sopra la descrizione."
          >
            <input
              name="shortTitle"
              value={form.shortTitle}
              onChange={onChange}
              placeholder="es. Giacca ad alta visibilità certificata"
              className={inputClass}
            />
          </AdminField>

          <AdminField
            className="sm:col-span-2"
            label="Descrizione breve (opzionale)"
          >
            <textarea
              name="shortDescription"
              value={form.shortDescription}
              onChange={onChange}
              rows={2}
              placeholder="Breve estratto visibile nella parte alta della scheda prodotto."
              className={textareaClass}
            />
          </AdminField>
        </div>
      </AdminSection>

      <AdminSection
        label="Specifiche tecniche e sconto"
        description="Dati usati nei badge della scheda e nel prezzo promozionale."
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <AdminField label="Colonna d'acqua (mm)">
            <input
              type="number"
              name="waterColumn"
              value={form.waterColumn}
              onChange={onChange}
              placeholder="es. 10000"
              className={inputClass}
            />
          </AdminField>

          <AdminField label="Temperatura minima (°C)">
            <input
              type="number"
              name="minTemp"
              value={form.minTemp}
              onChange={onChange}
              placeholder="es. -5"
              className={inputClass}
            />
          </AdminField>

          <AdminField label="Sconto (%)" hint="0 = nessuno sconto attivo.">
            <input
              type="number"
              min="0"
              max="100"
              name="discountPercent"
              value={form.discountPercent}
              onChange={onChange}
              placeholder="es. 15"
              className={inputClass}
            />
          </AdminField>

          <AdminField label="Sconto valido fino al">
            <input
              type="date"
              name="discountUntil"
              value={form.discountUntil}
              onChange={onChange}
              className={inputClass}
            />
          </AdminField>
        </div>

        <div className="mt-6 border-t border-line/60 pt-6">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={onChange}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-grass"
            />
            <span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-ink">
                In evidenza in homepage
              </span>
              <span className="mt-1 block text-xs font-light leading-relaxed text-ink-soft">
                Compare nel carosello dei prodotti selezionati.
              </span>
            </span>
          </label>
        </div>
      </AdminSection>
    </div>
  );
}
