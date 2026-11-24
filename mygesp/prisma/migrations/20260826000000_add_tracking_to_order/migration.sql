-- Aggiunge i dati di spedizione (corriere e tracking) all'ordine.
-- Necessari perché la route PATCH /api/admin/ordini li scrive sul modello Order.
ALTER TABLE "Order" ADD COLUMN "trackingCode" TEXT;
ALTER TABLE "Order" ADD COLUMN "carrier" TEXT;
