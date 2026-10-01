-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DA_CONTATTARE', 'CONTATTATO', 'IN_ATTESA', 'COLLOQUIO', 'RIFIUTATO', 'ASSUNTO', 'SCARTATO_DA_ME');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "placeId" TEXT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "website" TEXT,
    "email" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DA_CONTATTARE',
    "notes" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "scanResult" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastScannedAt" TIMESTAMP(3),

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_placeId_key" ON "Company"("placeId");
