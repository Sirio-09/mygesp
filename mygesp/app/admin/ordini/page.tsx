"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";

function OrdersSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-line p-5 space-y-5">
          <div className="flex justify-between items-center border-b border-line pb-4">
            <div className="space-y-2">
              <div className="h-3 w-32 bg-paper-warm"></div>
              <div className="h-2 w-24 bg-paper-warm"></div>
            </div>
            <div className="h-7 w-28 bg-paper-warm"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-2 w-16 bg-paper-warm"></div>
              <div className="h-3 w-48 bg-paper-warm"></div>
              <div className="h-3 w-40 bg-paper-warm"></div>
            </div>
            <div className="md:text-right space-y-2">
              <div className="h-2 w-12 bg-paper-warm md:ml-auto"></div>
              <div className="h-6 w-20 bg-paper-warm md:ml-auto"></div>
            </div>
          </div>
          <div className="h-16 bg-paper-warm"></div>
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

  // Filtraggio ordini in base alla ricerca e allo stato selezionato
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

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-ink">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-grass-deep">
              GESTIONE OPERATIVA
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
              Ordini Ricevuti
            </h1>
            <p className="text-xs text-ink-soft mt-1">
              Monitora gli acquisti, aggiorna lo stato e gestisci i dati di spedizione.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-ink border border-line bg-white hover:bg-paper-warm transition-colors shrink-0"
          >
            ← TORNA AL CATALOGO
          </Link>
        </div>
        <OrdersSkeleton />
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-ink">
      {/* Header Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-grass-deep">
            GESTIONE OPERATIVA
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
            Ordini Ricevuti
          </h1>
          <p className="text-xs text-ink-soft mt-1">
            Monitora gli acquisti, aggiorna lo stato e gestisci i dati di spedizione.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center justify-center px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-ink border border-line bg-white hover:bg-paper-warm transition-colors shrink-0"
        >
          ← TORNA AL CATALOGO
        </Link>
      </div>

      {/* Controlli di Filtro e Ricerca */}
      <div className="bg-white border border-line p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Barra di ricerca */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cerca per ID, Email o Nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-line bg-paper-warm px-3 py-2 text-xs text-ink focus:outline-none placeholder:text-ink-soft font-mono"
            />
          </div>

          {/* Filtro per Stato */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
              Stato:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-line bg-white text-ink text-xs font-bold uppercase tracking-wider px-3 py-2 focus:outline-none"
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
      </div>

      {/* Lista Ordini */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-line p-12 text-center text-xs uppercase tracking-wider text-ink-soft">
          Nessun ordine trovato con i filtri selezionati.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-line p-5 space-y-5"
            >
              {/* Riga Superiore */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
                <div className="space-y-0.5">
                  <p className="font-mono text-xs font-bold text-ink uppercase tracking-wider">
                    ID: #{order.id}
                  </p>
                  <p className="text-xs font-mono text-ink-soft">
                    Data: {new Date(order.createdAt).toLocaleString("it-IT")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
                    Stato
                  </label>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusSelect(order.id, e.target.value)}
                    className="border border-line bg-paper-warm text-ink text-xs font-semibold px-3 py-1.5 focus:outline-none"
                  >
                    <option value="paid">Pagato</option>
                    <option value="processing">In Lavorazione</option>
                    <option value="shipped">Spedito</option>
                    <option value="delivered">Consegnato</option>
                    <option value="canceled">Annullato</option>
                  </select>
                </div>
              </div>

              {/* Dettagli Cliente e Importo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block">
                    Spedizione
                  </span>
                  <p className="text-ink">
                    <strong className="font-semibold">Email:</strong> {order.customerEmail}
                  </p>
                  <p className="text-ink">
                    <strong className="font-semibold">Nome:</strong> {order.shippingName || "N/D"}
                  </p>
                  <p className="text-ink">
                    <strong className="font-semibold">Indirizzo:</strong> {order.shippingLine1 || "N/D"},{" "}
                    {order.shippingCity || ""} {order.shippingZip || ""} ({order.shippingCountry || "IT"})
                  </p>
                </div>

                <div className="md:text-right space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block">
                    Totale
                  </span>
                  <p className="text-xl font-extrabold font-mono text-ink">
                    € {(order.totalCents / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Articoli */}
              <div className="border-t border-line pt-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block">
                  Articoli
                </span>
                <div className="bg-paper-warm border border-line divide-y divide-line">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-xs p-3"
                    >
                      <div>
                        <span className="font-bold text-ink">
                          {item.variant.product.name}
                        </span>{" "}
                        <span className="text-ink-soft font-mono">
                          (Taglia: {item.variant.size})
                        </span>
                      </div>
                      <div className="font-mono text-right space-x-4">
                        <span className="text-ink-soft">x{item.quantity}</span>
                        <span className="font-bold text-ink">
                          € {((item.priceCents * item.quantity) / 100).toFixed(2)}
                        </span>
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
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-line p-6 max-w-md w-full space-y-5 shadow-lg">
            <div className="space-y-1 border-b border-line pb-3">
              <h2 className="text-base font-extrabold uppercase text-ink tracking-wider">
                Dati Spedizione
              </h2>
              <p className="text-xs text-ink-soft">
                Inserisci il codice di tracciamento per aggiornare lo stato dell'ordine.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold uppercase tracking-wider text-ink">
                  Corriere
                </label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full border border-line bg-paper-warm p-2 font-medium focus:outline-none"
                >
                  <option value="BRT">BRT Bartolini</option>
                  <option value="DHL">DHL Express</option>
                  <option value="GLS">GLS Italy</option>
                  <option value="Poste Italiane">Poste Italiane / Crono</option>
                  <option value="SDA">SDA Express Courier</option>
                  <option value="UPS">UPS</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold uppercase tracking-wider text-ink">
                  Codice di Tracciamento
                </label>
                <input
                  type="text"
                  placeholder="Es: 123456789IT"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="w-full border border-line bg-white p-2 font-mono text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-line">
              <button
                type="button"
                onClick={() => setSelectedOrderForShipping(null)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink border border-line bg-white hover:bg-paper-warm transition-colors"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={confirmShipping}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-grass hover:bg-grass-deep transition-colors"
              >
                Conferma Spedizione
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}