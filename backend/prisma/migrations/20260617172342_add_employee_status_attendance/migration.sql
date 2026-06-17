-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'ON_LEAVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'HALF_DAY', 'LEAVE', 'ABSENT');

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "attendances" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "work_date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attendances_employee_id_work_date_key" ON "attendances"("employee_id", "work_date");

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
