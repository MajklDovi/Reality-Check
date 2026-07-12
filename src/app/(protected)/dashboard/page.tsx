import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Přehled",
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [savedCount, comparisonCount, analysisCount, searchProfiles] = await Promise.all([
    prisma.savedProperty.count({ where: { userId } }),
    prisma.propertyComparison.count({ where: { userId } }),
    prisma.aIAnalysis.count({ where: { userId } }),
    prisma.searchProfile.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const stats = [
    { label: "Uložené nemovitosti", value: savedCount },
    { label: "Porovnání", value: comparisonCount },
    { label: "AI analýzy", value: analysisCount },
    { label: "Vyhledávací profily", value: searchProfiles.length },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Vítejte zpět{session?.user?.name ? `, ${session.user.name}` : ""}
        </h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Přehled vašich uložených nemovitostí, porovnání a analýz.
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

      <Card>
        <CardHeader>
          <CardTitle>Vyhledávací profily</CardTitle>
          <CardDescription>
            Profily popisují, co hledáte — AI podle nich hodnotí jednotlivé nabídky.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {searchProfiles.length === 0 ? (
            <EmptyState
              title="Zatím nemáte žádný vyhledávací profil"
              description="Vytvořte si profil svých požadavků a začněte přidávat nabídky nemovitostí."
              action={
                <Link href="/profile">
                  <Button>Vyplnit profil</Button>
                </Link>
              }
            />
          ) : (
            <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
              {searchProfiles.map((profile) => (
                <li key={profile.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{profile.name}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {profile.preferredCities.join(", ") || "Bez omezení lokality"}
                    </p>
                  </div>
                  <Badge variant={profile.isActive ? "success" : "default"}>
                    {profile.isActive ? "Aktivní" : "Neaktivní"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uložené nemovitosti</CardTitle>
          <CardDescription>Nabídky, které jste si uložili k porovnání.</CardDescription>
        </CardHeader>
        <CardContent>
          {savedCount === 0 ? (
            <EmptyState
              title="Žádné uložené nemovitosti"
              description="Přidávání nabídek z realitních portálů bude dostupné v další fázi projektu."
            />
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Máte uloženo {savedCount} nemovitostí. Detailní přehled bude dostupný v další fázi.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
