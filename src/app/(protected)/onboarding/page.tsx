import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SearchProfileWizard } from "@/components/search-profile-wizard/wizard";
import { EMPTY_WIZARD_DATA, wizardDraftSchema } from "@/lib/validations/search-profile";

export const metadata: Metadata = {
  title: "Vytvoření profilu hledání",
};

export default async function OnboardingPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [draft, regions] = await Promise.all([
    prisma.onboardingDraft.findUnique({ where: { userId } }),
    prisma.region.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true } }),
  ]);

  // Restore a saved draft; ignore it silently if its shape is no longer valid.
  const parsedDraft = draft ? wizardDraftSchema.safeParse(draft.data) : null;
  const initialData = parsedDraft?.success
    ? { ...EMPTY_WIZARD_DATA, ...parsedDraft.data }
    : EMPTY_WIZARD_DATA;
  const initialStep = parsedDraft?.success ? draft!.currentStep : 0;

  return (
    <SearchProfileWizard
      mode="create"
      initialData={initialData}
      initialStep={initialStep}
      regions={regions.map((r) => r.name)}
    />
  );
}
