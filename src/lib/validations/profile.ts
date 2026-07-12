import { z } from "zod";

const money = z.number("Zadejte platné číslo").min(0, "Hodnota nesmí být záporná").optional();

export const userProfileSchema = z.object({
  householdIncome: money,
  availableSavings: money,
  maximumMonthlyPayment: money,
});

export const accountSettingsSchema = z.object({
  name: z.string().min(2, "Jméno musí mít alespoň 2 znaky").max(100),
  language: z.enum(["cs", "sk", "en"]),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type AccountSettingsInput = z.infer<typeof accountSettingsSchema>;
