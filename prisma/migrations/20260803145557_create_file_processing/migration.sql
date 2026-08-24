-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "FileProcessingJob" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "status" "ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileProcessingJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessingResult" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "totalQuantity" INTEGER NOT NULL,
    "totalRevenue" DOUBLE PRECISION NOT NULL,
    "rowsProcessed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessingResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FileProcessingJob_fileId_key" ON "FileProcessingJob"("fileId");

-- CreateIndex
CREATE INDEX "FileProcessingJob_organizationId_idx" ON "FileProcessingJob"("organizationId");

-- CreateIndex
CREATE INDEX "FileProcessingJob_status_idx" ON "FileProcessingJob"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessingResult_jobId_key" ON "ProcessingResult"("jobId");

-- AddForeignKey
ALTER TABLE "ProcessingResult" ADD CONSTRAINT "ProcessingResult_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "FileProcessingJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
