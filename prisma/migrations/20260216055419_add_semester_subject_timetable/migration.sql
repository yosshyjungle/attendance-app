/*
  Warnings:

  - Added the required column `date` to the `Lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `period` to the `Lesson` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Semester" AS ENUM ('FIRST', 'SECOND');

-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('REGULAR', 'EXAM', 'EVENT');

-- AlterEnum
ALTER TYPE "AttendanceStatus" ADD VALUE 'OFFICIAL_ABSENCE';

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "notes" TEXT;

-- AlterTable: Add new columns (nullable first for existing data)
ALTER TABLE "Lesson" ADD COLUMN     "date" TIMESTAMP(3),
ADD COLUMN     "lessonType" "LessonType" NOT NULL DEFAULT 'REGULAR',
ADD COLUMN     "period" INTEGER,
ADD COLUMN     "subjectId" TEXT,
ALTER COLUMN "qrCodeToken" DROP NOT NULL;

-- Migrate existing data: date from startTime, period=1
UPDATE "Lesson" SET "date" = "startTime"::date, "period" = 1 WHERE "date" IS NULL;

-- Make date and period required
ALTER TABLE "Lesson" ALTER COLUMN "date" SET NOT NULL;
ALTER TABLE "Lesson" ALTER COLUMN "period" SET NOT NULL;

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimetableSlot" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "period" INTEGER NOT NULL,
    "subjectId" TEXT NOT NULL,
    "semester" "Semester" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimetableSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TimetableSlot_classId_dayOfWeek_period_semester_key" ON "TimetableSlot"("classId", "dayOfWeek", "period", "semester");

-- AddForeignKey
ALTER TABLE "TimetableSlot" ADD CONSTRAINT "TimetableSlot_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableSlot" ADD CONSTRAINT "TimetableSlot_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
