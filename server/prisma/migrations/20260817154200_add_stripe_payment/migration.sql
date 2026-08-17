-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "stripeSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "serviceTitle" TEXT NOT NULL,
    "serviceMethod" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'bdt',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "invoiceNumber" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'STRIPE_TEST',
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripeSessionId_key" ON "Payment"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON "Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_invoiceNumber_key" ON "Payment"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Payment_customerId_idx" ON "Payment"("customerId");

-- CreateIndex
CREATE INDEX "Payment_technicianId_idx" ON "Payment"("technicianId");

-- CreateIndex
CREATE INDEX "Payment_serviceRequestId_idx" ON "Payment"("serviceRequestId");
