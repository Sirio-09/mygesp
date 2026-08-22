-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "discountPercent" INTEGER,
ADD COLUMN     "discountUntil" TIMESTAMP(3),
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;
