-- Add joinOrder column to User table with auto-increment sequence

-- Create sequence for joinOrder
CREATE SEQUENCE "user_join_order_seq";

-- Add joinOrder column (nullable initially for backfill)
ALTER TABLE "User" ADD COLUMN "joinOrder" INTEGER;

-- Backfill existing users with sequential numbers based on createdAt
UPDATE "User" u
SET "joinOrder" = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt") AS rn
  FROM "User"
) sub
WHERE u.id = sub.id;

-- Set column to NOT NULL after backfill
ALTER TABLE "User" ALTER COLUMN "joinOrder" SET NOT NULL;

-- Set default value to use sequence for new inserts
ALTER TABLE "User" ALTER COLUMN "joinOrder" SET DEFAULT nextval('user_join_order_seq');

-- Synchronize sequence to start from max(joinOrder) + 1
SELECT setval('user_join_order_seq', COALESCE((SELECT MAX("joinOrder") FROM "User"), 1));
