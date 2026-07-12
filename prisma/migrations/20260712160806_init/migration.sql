-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SearchPurpose" AS ENUM ('OWN_LIVING', 'INVESTMENT', 'RECREATION', 'OTHER');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'HOUSE', 'LAND', 'COMMERCIAL', 'GARAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "Disposition" AS ENUM ('D_1_KK', 'D_1_1', 'D_2_KK', 'D_2_1', 'D_3_KK', 'D_3_1', 'D_4_KK', 'D_4_1', 'D_5_KK', 'D_5_1', 'D_6_AND_MORE', 'ATYPICAL', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "OwnershipType" AS ENUM ('PERSONAL', 'COOPERATIVE', 'MUNICIPAL', 'OTHER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "PropertyCondition" AS ENUM ('NEW_BUILD', 'EXCELLENT', 'GOOD', 'NEEDS_RENOVATION', 'UNDER_CONSTRUCTION', 'DEMOLITION', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "EnergyClass" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ConstructionType" AS ENUM ('BRICK', 'PANEL', 'WOOD', 'SKELETON', 'MIXED', 'OTHER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "SellerType" AS ENUM ('AGENCY', 'PRIVATE', 'DEVELOPER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'RESERVED', 'SOLD', 'REMOVED', 'EXPIRED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('MANUAL_LINK', 'METADATA_IMPORT', 'FEED', 'API');

-- CreateEnum
CREATE TYPE "RiskSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'BASIC', 'PREMIUM');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'EXPIRED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "externalAuthId" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "language" TEXT NOT NULL DEFAULT 'cs',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "householdIncome" DECIMAL(12,2),
    "availableSavings" DECIMAL(12,2),
    "maximumMonthlyPayment" DECIMAL(12,2),
    "preferredLanguage" TEXT NOT NULL DEFAULT 'cs',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" "SearchPurpose" NOT NULL DEFAULT 'OWN_LIVING',
    "minimumPrice" DECIMAL(12,2),
    "idealPrice" DECIMAL(12,2),
    "maximumPrice" DECIMAL(12,2),
    "minimumArea" DOUBLE PRECISION,
    "maximumArea" DOUBLE PRECISION,
    "minimumRooms" INTEGER,
    "maximumRooms" INTEGER,
    "preferredRegions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredCities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excludedLocations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "maximumCommuteMinutes" INTEGER,
    "commuteDestination" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preferences" (
    "id" TEXT NOT NULL,
    "searchProfileId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 3,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "disposition" "Disposition" NOT NULL DEFAULT 'UNKNOWN',
    "area" DOUBLE PRECISION,
    "region" TEXT,
    "district" TEXT,
    "city" TEXT,
    "cityPart" TEXT,
    "approximateAddress" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "ownershipType" "OwnershipType" NOT NULL DEFAULT 'UNKNOWN',
    "condition" "PropertyCondition" NOT NULL DEFAULT 'UNKNOWN',
    "floor" INTEGER,
    "totalFloors" INTEGER,
    "hasElevator" BOOLEAN,
    "hasBalcony" BOOLEAN,
    "hasTerrace" BOOLEAN,
    "hasGarden" BOOLEAN,
    "hasCellar" BOOLEAN,
    "hasGarage" BOOLEAN,
    "hasParking" BOOLEAN,
    "energyClass" "EnergyClass" NOT NULL DEFAULT 'UNKNOWN',
    "constructionType" "ConstructionType" NOT NULL DEFAULT 'UNKNOWN',
    "yearBuilt" INTEGER,
    "yearRenovated" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_listings" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "externalId" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "previewImageUrl" TEXT,
    "price" DECIMAL(12,2),
    "pricePerSquareMeter" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'CZK',
    "commissionIncluded" BOOLEAN,
    "sellerType" "SellerType" NOT NULL DEFAULT 'UNKNOWN',
    "agencyName" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listingStatus" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "dataCompleteness" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "imageUsageAllowed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "logoUrl" TEXT,
    "integrationType" "IntegrationType" NOT NULL DEFAULT 'MANUAL_LINK',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "allowPreviewImages" BOOLEAN NOT NULL DEFAULT false,
    "allowMetadataImport" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listing_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_history" (
    "id" TEXT NOT NULL,
    "propertyListingId" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_properties" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_comparisons" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_comparison_items" (
    "id" TEXT NOT NULL,
    "comparisonId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "property_comparison_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_analyses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "searchProfileId" TEXT,
    "overallScore" INTEGER NOT NULL,
    "financialScore" INTEGER,
    "requirementsScore" INTEGER,
    "locationScore" INTEGER,
    "priceScore" INTEGER,
    "conditionScore" INTEGER,
    "dataConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "summary" TEXT NOT NULL,
    "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weaknesses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "compromises" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "missingInformation" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_flags" (
    "id" TEXT NOT NULL,
    "aiAnalysisId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" "RiskSeverity" NOT NULL DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "recommendation" TEXT,

    CONSTRAINT "risk_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_limits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "aiAnalysesUsed" INTEGER NOT NULL DEFAULT 0,
    "savedPropertiesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_limits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_externalAuthId_key" ON "users"("externalAuthId");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE INDEX "search_profiles_userId_idx" ON "search_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "preferences_searchProfileId_key_key" ON "preferences"("searchProfileId", "key");

-- CreateIndex
CREATE INDEX "properties_city_idx" ON "properties"("city");

-- CreateIndex
CREATE INDEX "properties_propertyType_idx" ON "properties"("propertyType");

-- CreateIndex
CREATE INDEX "property_listings_propertyId_idx" ON "property_listings"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "property_listings_sourceId_externalId_key" ON "property_listings"("sourceId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "listing_sources_name_key" ON "listing_sources"("name");

-- CreateIndex
CREATE UNIQUE INDEX "listing_sources_domain_key" ON "listing_sources"("domain");

-- CreateIndex
CREATE INDEX "price_history_propertyListingId_recordedAt_idx" ON "price_history"("propertyListingId", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "saved_properties_userId_propertyId_key" ON "saved_properties"("userId", "propertyId");

-- CreateIndex
CREATE INDEX "property_comparisons_userId_idx" ON "property_comparisons"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "property_comparison_items_comparisonId_propertyId_key" ON "property_comparison_items"("comparisonId", "propertyId");

-- CreateIndex
CREATE INDEX "ai_analyses_userId_propertyId_idx" ON "ai_analyses"("userId", "propertyId");

-- CreateIndex
CREATE INDEX "risk_flags_aiAnalysisId_idx" ON "risk_flags"("aiAnalysisId");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "usage_limits_userId_period_key" ON "usage_limits"("userId", "period");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_profiles" ADD CONSTRAINT "search_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_searchProfileId_fkey" FOREIGN KEY ("searchProfileId") REFERENCES "search_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_listings" ADD CONSTRAINT "property_listings_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_listings" ADD CONSTRAINT "property_listings_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "listing_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_propertyListingId_fkey" FOREIGN KEY ("propertyListingId") REFERENCES "property_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_properties" ADD CONSTRAINT "saved_properties_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_properties" ADD CONSTRAINT "saved_properties_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_comparisons" ADD CONSTRAINT "property_comparisons_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_comparison_items" ADD CONSTRAINT "property_comparison_items_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "property_comparisons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_comparison_items" ADD CONSTRAINT "property_comparison_items_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_searchProfileId_fkey" FOREIGN KEY ("searchProfileId") REFERENCES "search_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_flags" ADD CONSTRAINT "risk_flags_aiAnalysisId_fkey" FOREIGN KEY ("aiAnalysisId") REFERENCES "ai_analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_limits" ADD CONSTRAINT "usage_limits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
