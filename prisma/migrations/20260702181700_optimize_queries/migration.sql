/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Made the column `expiresAt` on table `Session` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Conversation_ownerId_idx";

-- DropIndex
DROP INDEX "Message_conversationId_idx";

-- DropIndex
DROP INDEX "Message_senderId_idx";

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "expiresAt" SET NOT NULL;

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "Conversation_ownerId_createdAt_idx" ON "Conversation"("ownerId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_senderId_createdAt_idx" ON "Message"("senderId", "createdAt");

-- CreateIndex
CREATE INDEX "Organization_deletedAt_idx" ON "Organization"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
