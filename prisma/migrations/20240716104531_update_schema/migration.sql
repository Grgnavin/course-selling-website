-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "transactionId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "dataVerificationReq" JSONB,
    "apiQueryFromUser" JSONB,
    "paymenGateway" "PurchaseMethod" NOT NULL DEFAULT 'esewa',
    "status" "Status" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
