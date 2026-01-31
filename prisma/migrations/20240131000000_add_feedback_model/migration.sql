-- CreateEnum
CREATE TYPE "FeedbackCategory" AS ENUM ('BUG', 'SUGGESTION', 'QUESTION', 'OTHER');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED');

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "category" "FeedbackCategory" NOT NULL,
    "content" TEXT NOT NULL,
    "email" TEXT,
    "userId" TEXT,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_userId_idx" ON "Feedback"("userId");

-- CreateIndex
CREATE INDEX "Feedback_status_idx" ON "Feedback"("status");

-- CreateIndex
CREATE INDEX "Feedback_category_idx" ON "Feedback"("category");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
