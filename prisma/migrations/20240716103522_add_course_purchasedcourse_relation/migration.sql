-- CreateEnum
CREATE TYPE "Status" AS ENUM ('pending', 'failed', 'success', 'refunded');

-- CreateEnum
CREATE TYPE "PurchaseMethod" AS ENUM ('esewa', 'khalti');

-- CreateTable
CREATE TABLE "PurchasedCourse" (
    "id" SERIAL NOT NULL,
    "Price" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "purchaseMethod" "PurchaseMethod" NOT NULL DEFAULT 'esewa',
    "status" "Status" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchasedCourse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PurchasedCourse" ADD CONSTRAINT "PurchasedCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
