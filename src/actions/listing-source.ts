"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listingSourceSchema } from "@/lib/validations/listing-source";
import { Prisma } from "@/generated/prisma/client";

export type SourceActionResult = { success: true } | { success: false; error: string };

async function requireAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

export async function upsertListingSourceAction(input: unknown): Promise<SourceActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Vyžaduje administrátorská práva" };

  const parsed = listingSourceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Zkontrolujte vyplněné údaje",
    };
  }
  const { id, ...data } = parsed.data;
  const payload = {
    ...data,
    domain: data.domain.toLowerCase(),
    logoUrl: data.logoUrl || null,
  };

  try {
    if (id) {
      await prisma.listingSource.update({ where: { id }, data: payload });
    } else {
      await prisma.listingSource.create({ data: payload });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "Zdroj se stejným názvem nebo doménou už existuje" };
    }
    throw error;
  }

  revalidatePath("/admin/sources");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteListingSourceAction(sourceId: string): Promise<SourceActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Vyžaduje administrátorská práva" };

  const listingCount = await prisma.propertyListing.count({ where: { sourceId } });
  if (listingCount > 0) {
    return {
      success: false,
      error: `Zdroj má ${listingCount} navázaných nabídek — místo smazání ho deaktivujte.`,
    };
  }

  await prisma.listingSource.delete({ where: { id: sourceId } });
  revalidatePath("/admin/sources");
  revalidatePath("/admin");
  return { success: true };
}
