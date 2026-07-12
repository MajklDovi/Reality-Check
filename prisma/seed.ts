import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CZECH_REGIONS: { name: string; code: string }[] = [
  { name: "Hlavní město Praha", code: "PHA" },
  { name: "Středočeský kraj", code: "STC" },
  { name: "Jihočeský kraj", code: "JHC" },
  { name: "Plzeňský kraj", code: "PLK" },
  { name: "Karlovarský kraj", code: "KVK" },
  { name: "Ústecký kraj", code: "ULK" },
  { name: "Liberecký kraj", code: "LBK" },
  { name: "Královéhradecký kraj", code: "HKK" },
  { name: "Pardubický kraj", code: "PAK" },
  { name: "Kraj Vysočina", code: "VYS" },
  { name: "Jihomoravský kraj", code: "JHM" },
  { name: "Olomoucký kraj", code: "OLK" },
  { name: "Zlínský kraj", code: "ZLK" },
  { name: "Moravskoslezský kraj", code: "MSK" },
];

async function main() {
  console.log("🌱 Seeding database…");

  // --- Czech regions (reference data) --------------------------------------
  await Promise.all(
    CZECH_REGIONS.map((region, index) =>
      prisma.region.upsert({
        where: { code: region.code },
        update: { name: region.name, sortOrder: index },
        create: { ...region, sortOrder: index },
      })
    )
  );
  console.log(`  ✓ ${CZECH_REGIONS.length} Czech regions`);

  // --- Listing sources ---------------------------------------------------
  const sourcesData = [
    {
      name: "Sreality.cz",
      domain: "sreality.cz",
      integrationType: "METADATA_IMPORT" as const,
      allowMetadataImport: true,
      allowPreviewImages: false,
    },
    {
      name: "Bezrealitky.cz",
      domain: "bezrealitky.cz",
      integrationType: "METADATA_IMPORT" as const,
      allowMetadataImport: true,
      allowPreviewImages: false,
    },
    {
      name: "Reality.iDNES.cz",
      domain: "reality.idnes.cz",
      integrationType: "METADATA_IMPORT" as const,
      allowMetadataImport: true,
      allowPreviewImages: false,
    },
    {
      name: "Reality.cz",
      domain: "reality.cz",
      integrationType: "METADATA_IMPORT" as const,
      allowMetadataImport: true,
      allowPreviewImages: false,
    },
    {
      name: "RE/MAX Česká republika",
      domain: "remax-czech.cz",
      integrationType: "METADATA_IMPORT" as const,
      allowMetadataImport: true,
      allowPreviewImages: false,
    },
    {
      name: "M&M Reality",
      domain: "mmreality.cz",
      integrationType: "METADATA_IMPORT" as const,
      allowMetadataImport: true,
      allowPreviewImages: false,
    },
    {
      name: "Jiný zdroj (obecný)",
      domain: "generic",
      integrationType: "MANUAL_LINK" as const,
      allowMetadataImport: true,
      allowPreviewImages: false,
    },
  ];

  const sources = await Promise.all(
    sourcesData.map((source) =>
      prisma.listingSource.upsert({
        where: { domain: source.domain },
        update: {
          name: source.name,
          integrationType: source.integrationType,
          allowMetadataImport: source.allowMetadataImport,
        },
        create: { ...source },
      })
    )
  );
  console.log(`  ✓ ${sources.length} listing sources`);

  // --- Users --------------------------------------------------------------
  const adminPassword = await bcrypt.hash("admin1234", 12);
  await prisma.user.upsert({
    where: { email: "admin@realitycheck.local" },
    update: {},
    create: {
      email: "admin@realitycheck.local",
      name: "Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
      language: "cs",
      profile: { create: {} },
    },
  });

  const demoPassword = await bcrypt.hash("demo1234", 12);
  const demo = await prisma.user.upsert({
    where: { email: "demo@realitycheck.local" },
    update: {},
    create: {
      email: "demo@realitycheck.local",
      name: "Jan Novák",
      passwordHash: demoPassword,
      role: "USER",
      language: "cs",
      profile: {
        create: {
          householdIncome: 68000,
          availableSavings: 900000,
          maximumMonthlyPayment: 24000,
        },
      },
      subscriptions: {
        create: { plan: "FREE", status: "ACTIVE" },
      },
      usageLimits: {
        create: { period: "2026-07", aiAnalysesUsed: 2, savedPropertiesCount: 2 },
      },
    },
  });
  console.log("  ✓ users: admin@realitycheck.local / demo@realitycheck.local");

  // --- Search profile with preferences ------------------------------------
  const existingProfile = await prisma.searchProfile.findFirst({
    where: { userId: demo.id, name: "Byt pro rodinu v Brně" },
  });

  const profileData = {
    userId: demo.id,
    name: "Byt pro rodinu v Brně",
    purpose: "FAMILY_LIVING" as const,
    minimumPrice: 4500000,
    idealPrice: 6000000,
    maximumPrice: 7500000,
    ownSavings: 1500000,
    plannedMortgage: 5500000,
    netMonthlyIncome: 68000,
    existingMonthlyPayments: 4000,
    maximumMonthlyPayment: 24000,
    financialReserve: 300000,
    renovationBudget: 400000,
    furnishingBudget: 150000,
    propertyTypes: ["APARTMENT", "NEW_BUILD"] as const,
    dispositions: ["D_3_KK", "D_3_1", "D_4_KK"] as const,
    minimumArea: 65,
    maximumArea: 95,
    minimumRooms: 3,
    maximumRooms: 4,
    preferredRegions: ["Jihomoravský kraj"],
    preferredCities: ["Brno"],
    preferredCityParts: ["Královo Pole", "Žabovřesky"],
    excludedLocations: ["Brno-jih"],
    maximumCommuteMinutes: 30,
    commuteDestination: "Brno, Veveří",
    transportMode: "PUBLIC_TRANSPORT" as const,
    isActive: true,
    isDefault: true,
  };
  const profilePreferences = [
    { key: "parking", value: "true", priority: 10, isRequired: true },
    { key: "balcony", value: "true", priority: 7, isRequired: false },
    { key: "elevator", value: "true", priority: 4, isRequired: false },
    { key: "ownership", value: "PERSONAL", priority: 7, isRequired: false },
    { key: "quiet", value: "true", priority: 4, isRequired: false },
    { key: "schools", value: "true", priority: 7, isRequired: false },
    { key: "public_transport", value: "true", priority: 4, isRequired: false },
  ];

  const searchProfile = existingProfile
    ? await prisma.searchProfile.update({
        where: { id: existingProfile.id },
        data: {
          ...profileData,
          propertyTypes: [...profileData.propertyTypes],
          dispositions: [...profileData.dispositions],
          preferences: {
            deleteMany: {},
            create: profilePreferences,
          },
        },
      })
    : await prisma.searchProfile.create({
        data: {
          ...profileData,
          propertyTypes: [...profileData.propertyTypes],
          dispositions: [...profileData.dispositions],
          preferences: { create: profilePreferences },
        },
      });
  console.log("  ✓ search profile with preferences");

  // --- Properties + listings ----------------------------------------------
  const sreality = sources.find((s) => s.domain === "sreality.cz")!;
  const bezrealitky = sources.find((s) => s.domain === "bezrealitky.cz")!;

  const existingListing = await prisma.propertyListing.findUnique({
    where: { sourceId_externalId: { sourceId: sreality.id, externalId: "demo-1001" } },
  });
  if (existingListing) {
    console.log("  ✓ demo properties already seeded — skipping");
    console.log("✅ Seed finished.");
    return;
  }

  const property1 = await prisma.property.create({
    data: {
      propertyType: "APARTMENT",
      disposition: "D_3_KK",
      area: 78,
      region: "Jihomoravský kraj",
      district: "Brno-město",
      city: "Brno",
      cityPart: "Královo Pole",
      approximateAddress: "ulice Purkyňova, Brno-Královo Pole",
      latitude: 49.2245,
      longitude: 16.5891,
      ownershipType: "PERSONAL",
      condition: "GOOD",
      floor: 4,
      totalFloors: 8,
      hasElevator: true,
      hasBalcony: true,
      hasTerrace: false,
      hasGarden: false,
      hasCellar: true,
      hasGarage: false,
      hasParking: true,
      energyClass: "C",
      constructionType: "PANEL",
      yearBuilt: 1978,
      yearRenovated: 2019,
      listings: {
        create: {
          sourceId: sreality.id,
          addedByUserId: demo.id,
          externalId: "demo-1001",
          sourceUrl: "https://www.sreality.cz/detail/prodej/byt/3+kk/brno/demo-1001",
          title: "Prodej bytu 3+kk 78 m², Brno — Královo Pole",
          price: 6190000,
          pricePerSquareMeter: 79359,
          currency: "CZK",
          commissionIncluded: true,
          sellerType: "AGENCY",
          agencyName: "Demo Reality s.r.o.",
          listingStatus: "ACTIVE",
          dataCompleteness: 0.85,
          imageUsageAllowed: false,
          priceHistory: {
            create: [
              { price: 6390000, recordedAt: new Date("2026-05-15") },
              { price: 6290000, recordedAt: new Date("2026-06-10") },
              { price: 6190000, recordedAt: new Date("2026-07-01") },
            ],
          },
        },
      },
    },
  });

  const property2 = await prisma.property.create({
    data: {
      propertyType: "APARTMENT",
      disposition: "D_3_1",
      area: 84,
      region: "Jihomoravský kraj",
      district: "Brno-město",
      city: "Brno",
      cityPart: "Žabovřesky",
      approximateAddress: "ulice Minská, Brno-Žabovřesky",
      latitude: 49.2148,
      longitude: 16.5735,
      ownershipType: "COOPERATIVE",
      condition: "NEEDS_RENOVATION",
      floor: 2,
      totalFloors: 4,
      hasElevator: false,
      hasBalcony: true,
      hasTerrace: false,
      hasGarden: false,
      hasCellar: true,
      hasGarage: false,
      hasParking: false,
      energyClass: "D",
      constructionType: "BRICK",
      yearBuilt: 1962,
      listings: {
        create: {
          sourceId: bezrealitky.id,
          addedByUserId: demo.id,
          externalId: "demo-2002",
          sourceUrl: "https://www.bezrealitky.cz/nemovitosti-byty-domy/demo-2002",
          title: "Prodej bytu 3+1 84 m², Brno — Žabovřesky, družstevní",
          price: 5490000,
          pricePerSquareMeter: 65357,
          currency: "CZK",
          commissionIncluded: false,
          sellerType: "PRIVATE",
          listingStatus: "ACTIVE",
          dataCompleteness: 0.7,
          imageUsageAllowed: false,
          priceHistory: {
            create: [{ price: 5490000, recordedAt: new Date("2026-06-20") }],
          },
        },
      },
    },
  });
  console.log("  ✓ 2 properties with listings and price history");

  // --- Saved properties, comparison ---------------------------------------
  await prisma.savedProperty.createMany({
    data: [
      { userId: demo.id, propertyId: property1.id, note: "Skvělá lokalita, blízko VUT" },
      { userId: demo.id, propertyId: property2.id, note: "Levnější, ale družstvo a rekonstrukce" },
    ],
    skipDuplicates: true,
  });

  const comparison = await prisma.propertyComparison.create({
    data: {
      userId: demo.id,
      name: "Brno — užší výběr",
      items: {
        create: [
          { propertyId: property1.id, position: 0 },
          { propertyId: property2.id, position: 1 },
        ],
      },
    },
  });
  console.log(`  ✓ saved properties + comparison "${comparison.name}"`);

  // --- AI analysis with risk flags ----------------------------------------
  await prisma.aIAnalysis.create({
    data: {
      userId: demo.id,
      propertyId: property1.id,
      searchProfileId: searchProfile.id,
      overallScore: 82,
      financialScore: 78,
      requirementsScore: 90,
      locationScore: 88,
      priceScore: 72,
      conditionScore: 80,
      dataConfidence: 0.85,
      summary:
        "Byt velmi dobře odpovídá vašemu profilu. Lokalita i dispozice sedí, cena je mírně nad ideálem, ale v rámci maxima. Panelová konstrukce po revitalizaci.",
      strengths: [
        "Dispozice 3+kk v požadovaném rozmezí",
        "Výtah i parkování k dispozici",
        "Cena klesla za poslední 2 měsíce o 200 000 Kč",
      ],
      weaknesses: ["Cena nad ideální hranicí", "Panelová výstavba z roku 1978"],
      compromises: ["Bez garáže — pouze venkovní parkování"],
      missingInformation: ["Výše fondu oprav", "Detail rekonstrukce z roku 2019"],
      riskFlags: {
        create: [
          {
            type: "PRICE_ABOVE_IDEAL",
            severity: "LOW",
            title: "Cena nad ideální hranicí",
            description: "Nabídková cena 6,19 mil. Kč je o 190 tis. Kč nad vaším ideálem.",
            recommendation: "Cena v čase klesá — zvažte vyjednávání o dalších 3–5 %.",
          },
          {
            type: "PANEL_CONSTRUCTION",
            severity: "MEDIUM",
            title: "Panelová konstrukce",
            description: "Dům z roku 1978; stav revitalizace není z inzerátu zřejmý.",
            recommendation: "Ověřte stav stoupaček, zateplení a výši fondu oprav.",
          },
        ],
      },
    },
  });

  await prisma.aIAnalysis.create({
    data: {
      userId: demo.id,
      propertyId: property2.id,
      searchProfileId: searchProfile.id,
      overallScore: 61,
      financialScore: 85,
      requirementsScore: 55,
      locationScore: 82,
      priceScore: 80,
      conditionScore: 40,
      dataConfidence: 0.7,
      summary:
        "Cenově výhodná nabídka v dobré lokalitě, ale družstevní vlastnictví a nutná rekonstrukce představují zásadní kompromisy vůči vašim požadavkům.",
      strengths: ["Cena výrazně pod maximem", "Cihlová konstrukce", "Dobrá lokalita Žabovřesky"],
      weaknesses: [
        "Družstevní vlastnictví — omezené možnosti hypotéky",
        "Nutná kompletní rekonstrukce",
        "Chybí parkování (vaše povinná preference)",
      ],
      compromises: ["Bez výtahu ve 2. patře", "Náklady na rekonstrukci cca 800 tis. — 1,2 mil. Kč"],
      missingInformation: ["Podmínky převodu družstevního podílu", "Anuita"],
      riskFlags: {
        create: [
          {
            type: "COOPERATIVE_OWNERSHIP",
            severity: "HIGH",
            title: "Družstevní vlastnictví",
            description:
              "Byt nelze financovat klasickou hypotékou se zástavou nemovitosti; nutný úvěr ze stavebního spoření nebo převod do OV.",
            recommendation: "Ověřte plán převodu do osobního vlastnictví a výši anuity.",
          },
          {
            type: "MISSING_REQUIRED_PREFERENCE",
            severity: "HIGH",
            title: "Chybí parkování",
            description: "Parkování máte označené jako povinný požadavek, nabídka jej nezahrnuje.",
            recommendation: "Zjistěte možnosti rezidentního parkování v okolí.",
          },
          {
            type: "RENOVATION_NEEDED",
            severity: "MEDIUM",
            title: "Nutná rekonstrukce",
            description: "Byt je v původním stavu, počítejte s dodatečnou investicí.",
            recommendation: "Připočtěte odhad rekonstrukce k celkovým nákladům.",
          },
        ],
      },
    },
  });
  console.log("  ✓ 2 AI analyses with risk flags");

  console.log("✅ Seed finished.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
