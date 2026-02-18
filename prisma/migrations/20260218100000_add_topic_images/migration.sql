-- AlterTable
ALTER TABLE "Topic" ADD COLUMN "images" JSONB;

-- Backfill: sync existing imageUrl into images array
UPDATE "Topic" SET "images" = jsonb_build_array("imageUrl") WHERE "imageUrl" IS NOT NULL;
