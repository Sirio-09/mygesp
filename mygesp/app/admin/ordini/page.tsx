"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";

function OrdersSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-transparent border border-line/40 p-6 space-y-6">
          <div className="flex justify-between items-end border-b border-line/40 pb-4">
            <div className="space-y-3">
              <div className="h-3 w-32 bg-line/20 rounded-none"></div>
              <div className="h-2 w-24 bg-line/20 rounded-none"></div>
            </div>
            <div className="h-6 w-28 bg-line/20 rounded-none"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="h-2 w-16 bg-line/20 rounded-none"></div>
              <div className="h-3 w-48 bg-line/20 rounded-none"></div>
              <div className="h-3 w-40 bg-line/20 rounded-none"></div>
            </div>
            <div className="md:text-right space-y-3">
              <div className="h-2 w-12 bg-line/20 rounded-none md:ml-auto"></div>
              <div className="h-6 w-20 bg-line/20 rounded-none md:ml-auto"></div>
            </div>
          </div>
          <div className="h-16 bg-line/10 rounded-none"></div>
        </div>
      ))}
    </div>
  );
}

type OrderItem = {
  id: string;
  quantity: number;
  priceCents: number;
  variant: {
    size: string;
    sku: string;
    product: {
      name: string;
    };
  };
};

type Order = {
  id: string;
  customerEmail: string;
  shippingName: string | null;
  shippingLine1: string | null;
  shippingCity: string | null;
  shippingZip: string | null;
  shippingCountry: string | null;
  totalCents: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

export default function AdminOrdiniPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtri e Ricerca
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal Tracking
  const [selectedOrderForShipping, setSelectedOrderForShipping] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState("");
  const [carrier, setCarrier] = useState("BRT");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/ordini");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        toast.error("Impossibile caricare gli ordini");
      }
    } catch (err) {
      console.error("Errore caricamento ordini:", err);
      toast.error("Errore di connessione al server");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: string,
    trackCode?: string,
    carrierName?: string
  ) => {
    try {
      const res = await fetch("/api/admin/ordini", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          trackingCode: trackCode,
          carrier: carrierName,
        }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        toast.success(`Ordine #${orderId.slice(-6)} aggiornato`);
      } else {
        toast.error("Errore durante l'aggiornamento dell'ordine");
      }
    } catch (err) {
      console.error("Errore aggiornamento stato:", err);
      toast.error("Impossibile contattare il server");
    }
  };

  const handleStatusSelect = (orderId: string, newStatus: string) => {
    if (newStatus === "shipped") {
      setSelectedOrderForShipping(orderId);
    } else {
      updateOrderStatus(orderId, newStatus);
    }
  };

  const confirmShipping = () => {
    if (selectedOrderForShipping) {
      updateOrderStatus(selectedOrderForShipping, "shipped", trackingCode, carrier);
      setSelectedOrderForShipping(null);
      setTrackingCode("");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" ? true : order.status === statusFilter;

      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        query === "" ||
        order.id.toLowerCase().includes(query) ||
        order.customerEmail.toLowerCase().includes(query) ||
        (order.shippingName && order.shippingName.toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchTerm]);

  return (
    <main className="min-h-screen bg-paper py-12 px-4 sm:px-6 lg:px-8 selection:bg-grass selection:text-white">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-line/40 pb-8 mb-10">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-grass mb-2 block">
              Gestione Operativa
            </span>
            <h1 className="text-3xl font-light text-ink tracking-tight mb-2">
              Ordini Ricevuti
            </h1>
            <p className="text-sm text-ink-soft font-light">
              Monitora gli acquisti, aggiorna lo stato e gestisci le spedizioni.
            </p>
          </div>
          <Link
            href="/admin"
            className="text-[10px] font-semibold text-ink-soft hover:text-grass uppercase tracking-widest transition-colors mb-1"
          >
            &larr; Torna al Catalogo
          </Link>
        </div>

        {/* Controlli di Filtro e Ricerca */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cerca per ID, Email o Nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border border-line/40 px-4 py-3 text-sm text-ink focus:border-grass outline-none transition-colors placeholder:text-line placeholder:font-light font-mono"
            />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-ink-soft">
              Stato
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border border-line/40 text-ink text-sm font-light px-4 py-3 focus:outline-none focus:border-grass transition-colors appearance-none min-w-[160px]"
            >
              <option value="all">Tutti ({orders.length})</option>
              <option value="paid">Pagati</option>
              <option value="processing">In Lavorazione</option>
              <option value="shipped">Spediti</option>
              <option value="delivered">Consegnati</option>
              <option value="canceled">Annullati</option>
            </select>
          </div>
        </div>

        {loading ? (
          <OrdersSkeleton />
        ) : filteredOrders.length === 0 ? (
          <div className="border border-line/40 p-12 text-center text-sm font-light text-ink-soft bg-transparent">
            Nessun ordine trovato con i filtri attuali.
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-transparent border border-line/40 p-6 space-y-6">
                
                {/* Riga Superiore */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-line/40 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-semibold tracking-widest text-ink-soft block">
                      ID Ordine
                    </span>
                    <p className="font-mono text-sm text-ink">#{order.id}</p>
                    <p className="text-xs font-mono text-ink-soft">
                      {new Date(order.createdAt).toLocaleString("it-IT")}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 sm:text-right">
                    <label className="text-[10px] uppercase font-semibold tracking-widest text-ink-soft">
                      Stato Attuale
                    </label>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusSelect(order.id, e.target.value)}
                      className="bg-transparent border-b border-line/40 text-ink text-sm font-semibold pb-1 focus:outline-none focus:border-grass transition-colors cursor-pointer"
                    >
                      <option value="paid">Pagato</option>
                      <option value="processing">In Lavorazione</option>
                      <option value="shipped">Spedito</option>
                      <option value="delivered">Consegnato</option>
                      <option value="canceled">Annullato</option>
                    </select>
                  </div>
                </div>

                {/* Dettagli */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-light text-ink">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-semibold tracking-widest text-ink block mb-3">
                      Dettagli Spedizione
                    </span>
                    <p><strong className="font-medium">Email:</strong> {order.customerEmail}</p>
                    <p><strong className="font-medium">Nome:</strong> {order.shippingName || "N/D"}</p>
                    <p className="leading-relaxed">
                      <strong className="font-medium">Indirizzo:</strong><br/>
                      {order.shippingLine1 || "N/D"}<br/>
                      {order.shippingZip || ""} {order.shippingCity || ""} ({order.shippingCountry || "IT"})
                    </p>
                  </div>
                  <div className="md:text-right flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold tracking-widest text-ink block mb-2">
                        Totale Ordine
                      </span>
                      <p className="text-2xl font-light text-ink tracking-tight">
                        € {(order.totalCents / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Articoli */}
                <div className="pt-2">
                  <span className="text-[10px] uppercase font-semibold tracking-widest text-ink block mb-3">
                    Articoli ({order.items.length})
                  </span>
                  <div className="border border-line/40 divide-y divide-line/40 bg-line/5">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm p-4">
                        <div>
                          <span className="font-medium text-ink block">
                            {item.variant.product.name}
                          </span>
                          <span className="text-xs text-ink-soft">
                            Taglia: {item.variant.size} — SKU: {item.variant.sku}
                          </span>
                        </div>
                        <div className="font-mono text-right text-ink">
                          <span className="text-ink-soft mr-4 text-xs">x{item.quantity}</span>
                          € {((item.priceCents * item.quantity) / 100).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Tracking */}
        {selectedOrderForShipping && (
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-paper border border-line/40 p-8 max-w-md w-full shadow-2xl">
              <div className="mb-8">
                <h2 className="text-xl font-light text-ink tracking-tight mb-2">
                  Dati di Spedizione
                </h2>
                <p className="text-sm font-light text-ink-soft">
                  Inserisci il codice di tracciamento per confermare la spedizione dell'ordine.
                </p>
              </div>

              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-[10px] uppercase font-semibold tracking-widest text-ink mb-2">
                    Corriere
                  </label>
                  <select
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full bg-transparent border border-line/40 px-4 py-3 text-sm text-ink focus:border-grass outline-none transition-colors appearance-none"
                  >
                    <option value="BRT">BRT Bartolini</option>
                    <option value="DHL">DHL Express</option>
                    <option value="GLS">GLS Italy</option>
                    <option value="Poste Italiane">Poste Italiane / Crono</option>
                    <option value="SDA">SDA Express Courier</option>
                    <option value="UPS">UPS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold tracking-widest text-ink mb-2">
                    Codice di Tracciamento
                  </label>
                  <input
                    type="text"
                    placeholder="Es: 123456789IT"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    className="w-full bg-transparent border border-line/40 px-4 py-3 text-sm font-mono text-ink focus:border-grass outline-none transition-colors placeholder:text-line placeholder:font-sans"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-line/40">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForShipping(null)}
                  className="text-[10px] font-semibold text-ink-soft hover:text-ink uppercase tracking-widest transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={confirmShipping}
                  className="bg-ink hover:bg-grass text-white text-[10px] font-medium uppercase tracking-widest py-3 px-6 transition-colors"
                >
                  Conferma
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}