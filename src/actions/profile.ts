"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { accountSettingsSchema, userProfileSchema } from "@/lib/validations/profile";
import type { ActionResult } from "@/actions/auth";

export async function updateUserProfileAction(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nejste přihlášeni" };
  }

  const parsed = userProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Neplatná data formuláře" };
  }

  const { householdIncome, availableSavings, maximumMonthlyPayment } = parsed.data;
  const data = {
    householdIncome: householdIncome ?? null,
    availableSavings: availableSavings ?? null,
    maximumMonthlyPayment: maximumMonthlyPayment ?? null,
  };

  await prisma.userProfile.upsert({
    where: { userId: session.user.id },
    update: data,
    create: { userId: session.user.id, ...data },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function updateAccountSettingsAction(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nejste přihlášeni" };
  }

  const parsed = accountSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Neplatná data formuláře" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, language: parsed.data.language },
  });

  revalidatePath("/settings");
  return { success: true };
}
