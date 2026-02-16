-- CreateTable: TopicSummary
CREATE TABLE "TopicSummary" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable: GroundsSummary
CREATE TABLE "GroundsSummary" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "side" "Side" NOT NULL,
    "groundsJson" JSONB NOT NULL,
    "summaryText" TEXT NOT NULL,
    "opinionCountAtGeneration" INTEGER NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroundsSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable: OpinionGround
CREATE TABLE "OpinionGround" (
    "id" TEXT NOT NULL,
    "opinionId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "side" "Side" NOT NULL,
    "groundTitle" TEXT NOT NULL,
    "groundId" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpinionGround_pkey" PRIMARY KEY ("id")
);

-- AlterTable: Add isBot column to User
ALTER TABLE "User" ADD COLUMN "isBot" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "TopicSummary_topicId_key" ON "TopicSummary"("topicId");

-- CreateIndex
CREATE INDEX "GroundsSummary_topicId_idx" ON "GroundsSummary"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "GroundsSummary_topicId_side_key" ON "GroundsSummary"("topicId", "side");

-- CreateIndex
CREATE UNIQUE INDEX "OpinionGround_opinionId_key" ON "OpinionGround"("opinionId");

-- CreateIndex
CREATE INDEX "OpinionGround_topicId_side_idx" ON "OpinionGround"("topicId", "side");

-- AddForeignKey
ALTER TABLE "TopicSummary" ADD CONSTRAINT "TopicSummary_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroundsSummary" ADD CONSTRAINT "GroundsSummary_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpinionGround" ADD CONSTRAINT "OpinionGround_opinionId_fkey" FOREIGN KEY ("opinionId") REFERENCES "Opinion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpinionGround" ADD CONSTRAINT "OpinionGround_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
