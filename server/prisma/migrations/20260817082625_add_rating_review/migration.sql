-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceRequestId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "serviceQuality" INTEGER NOT NULL,
    "professionalism" INTEGER NOT NULL,
    "communication" INTEGER NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "Technician" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Review_serviceRequestId_key" ON "Review"("serviceRequestId");

-- CreateIndex
CREATE INDEX "Review_technicianId_idx" ON "Review"("technicianId");
