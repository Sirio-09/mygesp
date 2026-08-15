/*
  Warnings:

  - You are about to drop the column `isSuperAdmin` on the `Admin` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "isSuperAdmin",
ADD COLUMN     "isManager" BOOLEAN NOT NULL DEFAULT false;
