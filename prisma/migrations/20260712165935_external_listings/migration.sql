-- AlterEnum
BEGIN;
CREATE TYPE "ListingStatus_new" AS ENUM ('ACTIVE', 'INACTIVE', 'UNKNOWN', 'REMOVED');
ALTER TABLE "public"."property_listings" ALTER COLUMN "listingStatus" DROP DEFAULT;
ALTER TABLE "property_listings" ALTER COLUMN "listingStatus" TYPE "ListingStatus_new" USING ("listingStatus"::text::"ListingStatus_new");
ALTER TYPE "ListingStatus" RENAME TO "ListingStatus_old";
ALTER TYPE "ListingStatus_new" RENAME TO "ListingStatus";
DROP TYPE "public"."ListingStatus_old";
ALTER TABLE "property_listings" ALTER COLUMN "listingStatus" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "hasLoggia" BOOLEAN;

-- AlterTable
ALTER TABLE "property_listings" ADD COLUMN     "addedByUserId" TEXT,
ADD COLUMN     "monthlyCosts" DECIMAL(12,2),
ADD COLUMN     "userNote" TEXT;

-- CreateIndex
CREATE INDEX "property_listings_addedByUserId_idx" ON "property_listings"("addedByUserId");

-- AddForeignKey
ALTER TABLE "property_listings" ADD CONSTRAINT "property_listings_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

