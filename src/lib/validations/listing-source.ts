import { z } from "zod";

export const listingSourceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Zadejte název zdroje").max(100),
  domain: z
    .string()
    .min(2, "Zadejte doménu")
    .max(100)
    .regex(/^[a-z0-9.-]+$/i, "Doména smí obsahovat jen písmena, číslice, tečky a pomlčky"),
  logoUrl: z.union([z.url("Zadejte platnou URL loga"), z.literal("")]).optional(),
  integrationType: z.enum(["MANUAL_LINK", "METADATA_IMPORT", "FEED", "API"]),
  isActive: z.boolean(),
  allowPreviewImages: z.boolean(),
  allowMetadataImport: z.boolean(),
});

export type ListingSourceInput = z.infer<typeof listingSourceSchema>;
