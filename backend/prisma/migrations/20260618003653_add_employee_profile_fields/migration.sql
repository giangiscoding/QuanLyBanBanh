-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "employees"
  ADD COLUMN "email" TEXT,
  ADD COLUMN "gender" "Gender",
  ADD COLUMN "date_of_birth" DATE,
  ADD COLUMN "citizen_id" TEXT,
  ADD COLUMN "emergency_contact" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "employees_citizen_id_key" ON "employees"("citizen_id");
