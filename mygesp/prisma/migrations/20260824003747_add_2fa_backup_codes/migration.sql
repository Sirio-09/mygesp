-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "backupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[];
