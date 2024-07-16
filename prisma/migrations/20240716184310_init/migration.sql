/*
  Warnings:

  - The primary key for the `PurchasedCourse` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "PurchasedCourse" DROP CONSTRAINT "PurchasedCourse_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "PurchasedCourse_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PurchasedCourse_id_seq";
