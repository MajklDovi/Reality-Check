import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dispositionLabel, purposeLabel, propertyTypeLabel } from "@/lib/search-criteria";
import {
  computeProfileCompleteness,
  formatCzk,
  toPlainSearchProfile,
} from "@/lib/search-profile-utils";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Progress,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Přehled",
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [listingCount, savedCount, analysisCount, profileCount, activeProfile, draft] =
    await Promise.all([
      prisma.propertyListing.count({ where: { addedByUserId: userId } }),
      prisma.savedProperty.count({ where: { userId } }),
      prisma.aIAnalysis.count({ where: { userId } }),
      prisma.searchProfile.count({ where: { userId } }),
      prisma.searchProfile.findFirst({
        where: { userId, isActive: true },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        include: { preferences: { select: { key: true } } },
      }),
      prisma.onboardingDraft.findUnique({ where: { userId }, select: { id: true } }),
    ]);

  const stats = [
    { label: "Sledované nabídky", value: listingCount },
    { label: "Uložené nemovitosti", value: savedCount },
    { label: "AI analýzy", value: analysisCount },
    { label: "Profily hledání", value: profileCount },
  ];

  const plain = activeProfile ? toPlainSearchProfile(activeProfile) : null;
  const completeness =
    activeProfile && plain ? computeProfileCompleteness(plain, activeProfile.preferences) : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Vítejte zpět{session?.user?.name ? `, ${session.user.name}` : ""}
        </h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Přehled vašeho hledání, uložených nemovitostí a analýz.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
              <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active search profile */}
      {activeProfile && plain && completeness ? (
        <Card>
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{activeProfile.name}</CardTitle>
                {activeProfile.isDefault && <Badge variant="info">Výchozí</Badge>}
                <Badge variant="success">Aktivní</Badge>
              </div>
              <CardDescription className="mt-1">
                {purposeLabel(plain.purpose)} — podle tohoto profilu hodnotíme nabídky.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Link href={`/search-profiles/${activeProfile.id}/edit`}>
                <Button variant="outline" size="sm">
                  Upravit profil
                </Button>
              </Link>
              <Link href={`/search-profiles/${activeProfile.id}`}>
                <Button variant="secondary" size="sm">
                  Detail
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500 dark:text-zinc-400">Maximální cena</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {formatCzk(plain.maximumPrice)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500 dark:text-zinc-400">Lokalita</span>
                <span className="text-right font-medium text-zinc-900 dark:text-zinc-100">
                  {[...plain.preferredCities, ...plain.preferredRegions].slice(0, 2).join(", ") ||
                    "Bez omezení"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500 dark:text-zinc-400">Typ</span>
                <span className="text-right font-medium text-zinc-900 dark:text-zinc-100">
                  {plain.propertyTypes.slice(0, 3).map(propertyTypeLabel).join(", ") || "—"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500 dark:text-zinc-400">Dispozice</span>
                <span className="text-right font-medium text-zinc-900 dark:text-zinc-100">
                  {plain.dispositions.slice(0, 4).map(dispositionLabel).join(", ") || "Nezáleží"}
                </span>
              </div>
            </div>
            <Progress value={completeness.percent} label="Vyplněnost profilu" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Všechny profily najdete v{" "}
              <Link
                href="/search-profiles"
                className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                přehledu profilů
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title={
            profileCount > 0 ? "Nemáte žádný aktivní profil hledání" : "Zatím nemáte profil hledání"
          }
          description={
            profileCount > 0
              ? "Aktivujte některý ze svých profilů, aby bylo možné hodnotit nabídky."
              : draft
                ? "Máte rozpracovaný profil — pokračujte tam, kde jste skončili."
                : "Projděte krátkým průvodcem a popište, co hledáte. Zabere to jen pár minut."
          }
          action={
            profileCount > 0 ? (
              <Link href="/search-profiles">
                <Button>Spravovat profily</Button>
              </Link>
            ) : (
              <Link href="/onboarding">
                <Button>{draft ? "Pokračovat v profilu" : "Vytvořit profil hledání"}</Button>
              </Link>
            )
          }
        />
      )}

      {/* Listings */}
      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Sledované nabídky</CardTitle>
            <CardDescription className="mt-1">
              Nabídky z realitních portálů, které jste přidali k porovnání.
            </CardDescription>
          </div>
          <Link href="/properties/new">
            <Button size="sm">+ Přidat nabídku</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {listingCount === 0 ? (
            <EmptyState
              title="Zatím nesledujete žádnou nabídku"
              description="Vložte odkaz na inzerát z realitního portálu, nebo nabídku zadejte ručně — údaje pak porovnáme s vaším profilem hledání."
              action={
                <Link href="/properties/new">
                  <Button>Přidat první nabídku</Button>
                </Link>
              }
            />
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Sledujete {listingCount}{" "}
              {listingCount === 1 ? "nabídku" : listingCount < 5 ? "nabídky" : "nabídek"} —{" "}
              <Link
                href="/properties"
                className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                zobrazit všechny
              </Link>
              .
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
