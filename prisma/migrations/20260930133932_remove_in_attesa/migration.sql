/*
  Warnings:

  - The values [IN_ATTESA] on the enum `ApplicationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ApplicationStatus_new" AS ENUM ('DA_CONTATTARE', 'CONTATTATO', 'COLLOQUIO', 'RIFIUTATO', 'ASSUNTO', 'SCARTATO_DA_ME');
ALTER TABLE "public"."Company" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Company" ALTER COLUMN "status" TYPE "ApplicationStatus_new" USING ("status"::text::"ApplicationStatus_new");
ALTER TYPE "ApplicationStatus" RENAME TO "ApplicationStatus_old";
ALTER TYPE "ApplicationStatus_new" RENAME TO "ApplicationStatus";
DROP TYPE "public"."ApplicationStatus_old";
ALTER TABLE "Company" ALTER COLUMN "status" SET DEFAULT 'DA_CONTATTARE';
COMMIT;
