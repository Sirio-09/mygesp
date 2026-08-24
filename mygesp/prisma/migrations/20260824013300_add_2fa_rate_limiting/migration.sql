-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "failed2faAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lockoutUntil" TIMESTAMP(3);
