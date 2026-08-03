"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NuovoProdotto() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "", slug: "", description: "", brand: "", category: "",
    waterColumn: "", minTemp: "", size: "", sku: "", priceCents: "", stock: ""
  })
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch("/api/admin/prodotti", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
    if (res.ok) {
      router.push("/admin")
    } else {
      setError("Errore nel salvataggio, controlla i campi")
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto" }}>
      <h1>Nuovo prodotto</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input name="name" placeholder="Nome prodotto" onChange={handleChange} required />
        <input name="slug" placeholder="Slug (es. giacca-uragan-tex)" onChange={handleChange} required />
        <textarea name="description" placeholder="Descrizione" onChange={handleChange} required />
        <input name="brand" placeholder="Marchio" onChange={handleChange} required />
        <input name="category" placeholder="Categoria" onChange={handleChange} required />
        <input name="waterColumn" placeholder="Colonna d'acqua (mm)" onChange={handleChange} />
        <input name="minTemp" placeholder="Temperatura minima (°C)" onChange={handleChange} />
        <input name="size" placeholder="Taglia (es. M)" onChange={handleChange} required />
        <input name="sku" placeholder="SKU" onChange={handleChange} required />
        <input name="priceCents" placeholder="Prezzo in centesimi (es. 6500)" onChange={handleChange} required />
        <input name="stock" placeholder="Quantità disponibile" onChange={handleChange} required />
        <button type="submit">Salva prodotto</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  )
}