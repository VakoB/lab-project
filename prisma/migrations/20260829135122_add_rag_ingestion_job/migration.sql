-- CreateTable
CREATE TABLE "RagIngestionJob" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "status" "ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "chunkCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RagIngestionJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RagIngestionJob_organizationId_idx" ON "RagIngestionJob"("organizationId");

-- CreateIndex
CREATE INDEX "RagIngestionJob_status_idx" ON "RagIngestionJob"("status");

-- CreateIndex
CREATE INDEX "RagIngestionJob_fileId_idx" ON "RagIngestionJob"("fileId");

-- AddForeignKey
ALTER TABLE "RagIngestionJob" ADD CONSTRAINT "RagIngestionJob_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RagIngestionJob" ADD CONSTRAINT "RagIngestionJob_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
