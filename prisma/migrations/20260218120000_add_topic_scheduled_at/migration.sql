-- AlterTable
ALTER TABLE "Topic" ADD COLUMN "scheduledAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Topic_scheduledAt_idx" ON "Topic"("scheduledAt");
