import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SearchProfileWizard } from "@/components/search-profile-wizard/wizard";
import { profileToWizardData, toPlainSearchProfile } from "@/lib/search-profile-utils";

export const metadata: Metadata = {
  title: "Úprava profilu",
};

export default async function EditSearchProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const [profile, regions] = await Promise.all([
    prisma.searchProfile.findFirst({
      where: { id, userId: session!.user.id },
      include: { preferences: true },
    }),
    prisma.region.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true } }),
  ]);
  if (!profile) notFound();

  const initialData = profileToWizardData(toPlainSearchProfile(profile), profile.preferences);

  return (
    <SearchProfileWizard
      mode="edit"
      profileId={profile.id}
      initialData={initialData}
      regions={regions.map((r) => r.name)}
    />
  );
}
