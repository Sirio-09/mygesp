"use client";

import { useEffect, useState } from "react";

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

  // Stato per il popup tracking
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
      }
    } catch (err) {
      console.error("Errore caricamento ordini:", err);
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
      }
    } catch (err) {
      console.error("Errore aggiornamento stato:", err);
    }
  };

  const handleStatusSelect = (orderId: string, newStatus: string) => {
    if (newStatus === "shipped") {
      // Apri il modale per inserire il codice di tracciamento
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

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Caricamento ordini in corso...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestione Ordini</h1>
        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
          Totale ordini: {orders.length}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border text-gray-500">
          Nessun ordine trovato.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border rounded-xl p-6 bg-white shadow-sm space-y-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                <div>
                  <p className="font-mono text-sm font-semibold text-gray-800">
                    ID Ordine: #{order.id}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Data: {new Date(order.createdAt).toLocaleString("it-IT")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">Stato:</span>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusSelect(order.id, e.target.value)}
                    className="border rounded-lg px-3 py-1.5 text-sm bg-gray-50 font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="paid">💳 Pagato</option>
                    <option value="processing">📦 In Lavorazione</option>
                    <option value="shipped">🚚 Spedito</option>
                    <option value="delivered">✅ Consegnato</option>
                    <option value="canceled">❌ Annullato</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">Cliente & Spedizione</p>
                  <p className="text-gray-600"><strong>Email:</strong> {order.customerEmail}</p>
                  <p className="text-gray-600"><strong>Nome:</strong> {order.shippingName || "N/D"}</p>
                  <p className="text-gray-600">
                    <strong>Indirizzo:</strong> {order.shippingLine1 || "N/D"}, {order.shippingCity || ""}{" "}
                    {order.shippingZip || ""} ({order.shippingCountry || "IT"})
                  </p>
                </div>

                <div className="md:text-right space-y-1">
                  <p className="font-semibold text-gray-900">Importo</p>
                  <p className="text-2xl font-bold text-black">
                    €{(order.totalCents / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="font-semibold text-gray-900 text-sm mb-2">Articoli Ordinati</p>
                <div className="divide-y divide-gray-100 bg-gray-50 rounded-lg p-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm py-2">
                      <div>
                        <span className="font-medium text-gray-800">
                          {item.variant.product.name}
                        </span>{" "}
                        <span className="text-gray-500 text-xs">(Taglia: {item.variant.size})</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-600 mr-4">x{item.quantity}</span>
                        <span className="font-medium text-gray-900">
                          €{((item.priceCents * item.quantity) / 100).toFixed(2)}
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

      {/* MODALE DI INSERIMENTO TRACKING SPEDIZIONE */}
      {selectedOrderForShipping && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Conferma Spedizione & Tracking</h3>
            <p className="text-sm text-gray-600">
              Inserisci i dati del corriere per inviare l'email di conferma spedizione al cliente.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Corriere</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Codice di Tracciamento (Opzionale)
                </label>
                <input
                  type="text"
                  placeholder="Es: 123456789IT"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setSelectedOrderForShipping(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Annulla
              </button>
              <button
                onClick={confirmShipping}
                className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg"
              >
                Invia Email e Spedisci
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}