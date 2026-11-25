"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminEmptyState from "@/components/admin/ui/AdminEmptyState";
import AdminField from "@/components/admin/ui/AdminField";
import AdminModal from "@/components/admin/ui/AdminModal";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import AdminSkeleton from "@/components/admin/ui/AdminSkeleton";
import { inputClass, labelClass, selectClass } from "@/components/admin/ui/field-styles";
import { ChevronDown, Package, Search } from "@/components/admin/ui/icons";
import {
  ORDER_STATUS_OPTIONS,
  ORDER_STATUS_TONES,
  orderStatusLabel,
} from "@/lib/order-status";
import { formatEuro } from "@/lib/site";

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

const CARRIERS = [
  "BRT Bartolini",
  "DHL Express",
  "GLS Italy",
  "Poste Italiane / Crono",
  "SDA Express Courier",
  "UPS",
];

export default function AdminOrdiniPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtri e ricerca
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modale tracking
  const [selectedOrderForShipping, setSelectedOrderForShipping] = useState<
    string | null
  >(null);
  const [trackingCode, setTrackingCode] = useState("");
  const [trackingError, setTrackingError] = useState("");
  const [carrier, setCarrier] = useState(CARRIERS[0]);

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

  useEffect(() => {
    fetchOrders();
  }, []);

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
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Errore durante l'aggiornamento dell'ordine");
      }
    } catch (err) {
      console.error("Errore aggiornamento stato:", err);
      toast.error("Impossibile contattare il server");
    }
  };

  const handleStatusSelect = (orderId: string, newStatus: string) => {
    if (newStatus === "shipped") {
      setTrackingError("");
      setSelectedOrderForShipping(orderId);
    } else {
      updateOrderStatus(orderId, newStatus);
    }
  };

  const closeShippingModal = () => {
    setSelectedOrderForShipping(null);
    setTrackingError("");
  };

  const confirmShipping = () => {
    if (!selectedOrderForShipping) return;

    if (!trackingCode.trim()) {
      setTrackingError(
        "Inserisci il codice di tracciamento per confermare la spedizione."
      );
      return;
    }

    updateOrderStatus(
      selectedOrderForShipping,
      "shipped",
      trackingCode.trim(),
      carrier
    );
    setSelectedOrderForShipping(null);
    setTrackingCode("");
    setTrackingError("");
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

  const hasActiveFilters = searchTerm.trim() !== "" || statusFilter !== "all";

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Gestione operativa"
        title="Ordini ricevuti"
        description="Monitora gli acquisti, aggiorna lo stato e registra i dati di spedizione."
        actions={
          <AdminButton variant="secondary" onClick={fetchOrders}>
            Aggiorna elenco
          </AdminButton>
        }
      />

      {/* Ricerca e filtro stato */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="sm:max-w-sm sm:flex-1">
          <label htmlFor="order-search" className={`${labelClass} mb-2`}>
            Cerca
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft" />
            <input
              id="order-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ID ordine, email o nome"
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="order-status-filter" className={`${labelClass} mb-2`}>
            Stato
          </label>
          <div className="relative">
            <select
              id="order-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${selectClass} min-w-[11rem]`}
            >
              <option value="all">Tutti ({orders.length})</option>
              {ORDER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft" />
          </div>
        </div>
      </div>

      {!loading && (
        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
          {filteredOrders.length} di {orders.length} ordini
        </p>
      )}

      <div className="mt-4">
        {loading ? (
          <AdminSkeleton rows={3} />
        ) : filteredOrders.length === 0 ? (
          <AdminEmptyState
            icon={<Package className="h-5 w-5" />}
            title={
              hasActiveFilters ? "Nessun ordine con questi filtri" : "Nessun ordine ricevuto"
            }
            description={
              hasActiveFilters
                ? "Prova a cambiare stato o a svuotare la ricerca."
                : "Gli ordini compariranno qui appena un cliente completa il pagamento."
            }
            action={
              hasActiveFilters ? (
                <AdminButton variant="secondary" onClick={resetFilters}>
                  Azzera filtri
                </AdminButton>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <article key={order.id} className="border border-line bg-paper">
                <header className="flex flex-col gap-4 border-b border-line/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                      Ordine
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3">
                      <p className="truncate font-mono text-sm text-ink">
                        #{order.id}
                      </p>
                      <AdminBadge
                        tone={ORDER_STATUS_TONES[order.status] ?? "neutral"}
                      >
                        {orderStatusLabel(order.status)}
                      </AdminBadge>
                    </div>
                    <p className="mt-1.5 font-mono text-[11px] tabular-nums text-ink-soft">
                      {new Date(order.createdAt).toLocaleString("it-IT")}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <label
                      htmlFor={`order-status-${order.id}`}
                      className={`${labelClass} mb-2`}
                    >
                      Aggiorna stato
                    </label>
                    <div className="relative">
                      <select
                        id={`order-status-${order.id}`}
                        value={order.status}
                        onChange={(e) =>
                          handleStatusSelect(order.id, e.target.value)
                        }
                        className={`${selectClass} min-w-[10rem] py-2`}
                      >
                        {!ORDER_STATUS_OPTIONS.some(
                          (option) => option.value === order.status
                        ) && (
                          <option value={order.status}>
                            {orderStatusLabel(order.status)}
                          </option>
                        )}
                        {ORDER_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft" />
                    </div>
                  </div>
                </header>

                <div className="grid grid-cols-1 gap-6 px-5 py-6 sm:px-6 md:grid-cols-2">
                  <div>
                    <p className={labelClass}>Spedizione</p>
                    <div className="mt-3 space-y-1 text-sm font-light leading-relaxed text-ink">
                      <p className="font-medium">
                        {order.shippingName || "Nome non disponibile"}
                      </p>
                      <p className="text-ink-soft">{order.customerEmail}</p>
                      <p>{order.shippingLine1 || "Indirizzo non disponibile"}</p>
                      <p>
                        {order.shippingZip || "—"} {order.shippingCity || ""} (
                        {order.shippingCountry || "IT"})
                      </p>
                    </div>
                  </div>

                  <div className="md:text-right">
                    <p className={labelClass}>Totale ordine</p>
                    <p className="mt-3 text-2xl font-light tabular-nums tracking-tight text-ink">
                      {formatEuro(order.totalCents)}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                      {order.items.length}{" "}
                      {order.items.length === 1 ? "articolo" : "articoli"}
                    </p>
                  </div>
                </div>

                <div className="border-t border-line/60 px-5 py-6 sm:px-6">
                  <p className={labelClass}>Articoli</p>
                  <ul className="mt-3 divide-y divide-line/60 border border-line/60">
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start justify-between gap-4 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-light text-ink">
                            {item.variant.product.name}
                          </p>
                          <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                            Taglia {item.variant.size} &middot; SKU{" "}
                            {item.variant.sku}
                          </p>
                        </div>
                        <div className="shrink-0 text-right font-mono text-xs tabular-nums text-ink">
                          <span className="mr-3 text-ink-soft">
                            &times;{item.quantity}
                          </span>
                          {formatEuro(item.priceCents * item.quantity)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

              </article>
            ))}
          </div>
        )}
      </div>

      <AdminModal
        open={selectedOrderForShipping !== null}
        onClose={closeShippingModal}
        title="Dati di spedizione"
        description="Registra corriere e codice di tracciamento: lo stato passerà a «Spedito»."
        footer={
          <>
            <AdminButton variant="secondary" onClick={closeShippingModal}>
              Annulla
            </AdminButton>
            <AdminButton onClick={confirmShipping}>
              Conferma spedizione
            </AdminButton>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label
              htmlFor="shipping-carrier"
              className={`${labelClass} mb-2`}
            >
              Corriere
            </label>
            <div className="relative">
              <select
                id="shipping-carrier"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className={selectClass}
              >
                {CARRIERS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft" />
            </div>
          </div>

          <AdminField
            label="Codice di tracciamento"
            required
            error={trackingError}
            hint="Lo fornisce il corriere alla presa in carico del pacco."
          >
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => {
                setTrackingCode(e.target.value);
                if (trackingError) setTrackingError("");
              }}
              placeholder="es. 123456789IT"
              className={`${inputClass} font-mono`}
            />
          </AdminField>
        </div>
      </AdminModal>

    </>
  );
}

