-- Add composite indexes for performance optimization

-- Topic: Featured topics sorting optimization
CREATE INDEX "Topic_isFeatured_featuredAt_idx" ON "Topic"("isFeatured", "featuredAt");

-- Topic: Admin page filtering optimization
CREATE INDEX "Topic_isHidden_createdAt_idx" ON "Topic"("isHidden", "createdAt");

-- Vote: Guest vote lookup optimization (prevents full scan)
CREATE INDEX "Vote_topicId_visitorId_ipAddress_idx" ON "Vote"("topicId", "visitorId", "ipAddress");

-- Reaction: Guest reaction lookup optimization (prevents full scan)
CREATE INDEX "Reaction_opinionId_visitorId_ipAddress_idx" ON "Reaction"("opinionId", "visitorId", "ipAddress");
