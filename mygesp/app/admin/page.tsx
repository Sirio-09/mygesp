import Link from "next/link"

export default function AdminHome() {
  return (
    <div style={{ maxWidth: 600, margin: "60px auto" }}>
      <h1>Area amministrazione</h1>
      <Link href="/admin/nuovo-prodotto">+ Aggiungi nuovo prodotto</Link>
    </div>
  )
}