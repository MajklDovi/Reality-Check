-- CreateEnum
CREATE TYPE "DesiredPropertyType" AS ENUM ('APARTMENT', 'FAMILY_HOUSE', 'TOWNHOUSE', 'VILLA', 'COTTAGE', 'RECREATIONAL_PROPERTY', 'BUILDING_PLOT', 'COOPERATIVE_APARTMENT', 'ATELIER', 'NON_RESIDENTIAL_UNIT', 'NEW_BUILD', 'PRE_RENOVATION');

-- CreateEnum
CREATE TYPE "TransportMode" AS ENUM ('CAR', 'PUBLIC_TRANSPORT', 'BICYCLE', 'WALKING');

-- AlterEnum
BEGIN;
CREATE TYPE "SearchPurpose_new" AS ENUM ('OWN_LIVING', 'FAMILY_LIVING', 'INVESTMENT_LONG_TERM_RENT', 'INVESTMENT_SHORT_TERM_RENT', 'RECREATION', 'RENOVATION_PROJECT', 'RESALE', 'FOR_RELATIVES');
ALTER TABLE "public"."search_profiles" ALTER COLUMN "purpose" DROP DEFAULT;
ALTER TABLE "search_profiles" ALTER COLUMN "purpose" TYPE "SearchPurpose_new" USING ("purpose"::text::"SearchPurpose_new");
ALTER TYPE "SearchPurpose" RENAME TO "SearchPurpose_old";
ALTER TYPE "SearchPurpose_new" RENAME TO "SearchPurpose";
DROP TYPE "public"."SearchPurpose_old";
ALTER TABLE "search_profiles" ALTER COLUMN "purpose" SET DEFAULT 'OWN_LIVING';
COMMIT;

-- AlterTable
ALTER TABLE "preferences" ALTER COLUMN "priority" SET DEFAULT 4;

-- AlterTable
ALTER TABLE "search_profiles" ADD COLUMN     "dispositions" "Disposition"[] DEFAULT ARRAY[]::"Disposition"[],
ADD COLUMN     "existingMonthlyPayments" DECIMAL(12,2),
ADD COLUMN     "financialReserve" DECIMAL(12,2),
ADD COLUMN     "furnishingBudget" DECIMAL(12,2),
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maximumMonthlyPayment" DECIMAL(12,2),
ADD COLUMN     "netMonthlyIncome" DECIMAL(12,2),
ADD COLUMN     "ownSavings" DECIMAL(12,2),
ADD COLUMN     "plannedMortgage" DECIMAL(12,2),
ADD COLUMN     "preferredCityParts" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "propertyTypes" "DesiredPropertyType"[] DEFAULT ARRAY[]::"DesiredPropertyType"[],
ADD COLUMN     "renovationBudget" DECIMAL(12,2),
ADD COLUMN     "transportMode" "TransportMode";

-- CreateTable
CREATE TABLE "onboarding_drafts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "data" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_drafts_userId_key" ON "onboarding_drafts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "regions_name_key" ON "regions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "regions_code_key" ON "regions"("code");

-- AddForeignKey
ALTER TABLE "onboarding_drafts" ADD CONSTRAINT "onboarding_drafts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

