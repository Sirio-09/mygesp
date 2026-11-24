-- Add stripeSessionId to Order for Stripe webhook idempotency
ALTER TABLE "Order" ADD COLUMN "stripeSessionId" TEXT;