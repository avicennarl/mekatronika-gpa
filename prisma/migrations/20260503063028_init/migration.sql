-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('TEORI', 'PRAKTIK');

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "sks" INTEGER NOT NULL,
    "type" "CourseType" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Course_semester_type_idx" ON "Course"("semester", "type");
