import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PLAN, PLAN_LIMITS } from "@/config/plans";
import { purposeLabel } from "@/lib/search-criteria";
import {
  computeProfileCompleteness,
  formatCzk,
  toPlainSearchProfile,
} from "@/lib/search-profile-utils";
import { ProfileActions } from "@/components/search-profiles/profile-actions";
import { Alert, Badge, Button, Card, CardContent, EmptyState, Progress } from "@/components/ui";

export const metadata: Metadata = {
  title: "Profily hledání",
};

export default async function SearchProfilesPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [profiles, subscription] = await Promise.all([
    prisma.searchProfile.findMany({
      where: { userId },
      include: { preferences: { select: { key: true } } },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
    prisma.subscription.findFirst({
      where: { userId, status: { in: ["ACTIVE", "TRIALING"] } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const plan = subscription?.plan ?? DEFAULT_PLAN;
  const limits = PLAN_LIMITS[plan];
  const activeCount = profiles.filter((p) => p.isActive).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Profily hledání</h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Každý profil popisuje jedno hledání — AI podle něj hodnotí nabídky.
          </p>
        </div>
        <Link href="/onboarding">
          <Button>Nový profil</Button>
        </Link>
      </div>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Plán <Badge variant="info">{plan}</Badge> — aktivní profily: {activeCount} z{" "}
        {limits.maxActiveSearchProfiles}, celkem: {profiles.length} z {limits.maxSearchProfiles}.
      </p>

      {profiles.length === 0 ? (
        <EmptyState
          title="Zatím nemáte žádný profil hledání"
          description="Projděte krátkým průvodcem a popište, co hledáte — podle profilu pak ohodnotíme jednotlivé nabídky."
          action={
            <Link href="/onboarding">
              <Button>Vytvořit první profil</Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {profiles.map((profile) => {
            const plain = toPlainSearchProfile(profile);
            const completeness = computeProfileCompleteness(plain, profile.preferences);
            const locations =
              [...plain.preferredCities, ...plain.preferredRegions].slice(0, 3).join(", ") ||
              "Bez omezení lokality";

            return (
              <Card key={profile.id}>
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/search-profiles/${profile.id}`}
                          className="text-lg font-semibold text-zinc-900 hover:underline dark:text-zinc-50"
                        >
                          {profile.name}
                        </Link>
                        {profile.isDefault && <Badge variant="info">Výchozí</Badge>}
                        <Badge variant={profile.isActive ? "success" : "default"}>
                          {profile.isActive ? "Aktivní" : "Neaktivní"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {purposeLabel(plain.purpose)} · do {formatCzk(plain.maximumPrice)} ·{" "}
                        {locations}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Link href={`/search-profiles/${profile.id}`}>
                        <Button variant="outline" size="sm">
                          Zobrazit
                        </Button>
                      </Link>
                      <Link href={`/search-profiles/${profile.id}/edit`}>
                        <Button variant="secondary" size="sm">
                          Upravit
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <Progress value={completeness.percent} label="Vyplněnost profilu" />

                  <ProfileActions
                    profileId={profile.id}
                    profileName={profile.name}
                    isActive={profile.isActive}
                    isDefault={profile.isDefault}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {activeCount >= limits.maxActiveSearchProfiles && profiles.length > 0 && (
        <Alert variant="info" title="Limit aktivních profilů">
          Váš plán {plan} umožňuje {limits.maxActiveSearchProfiles}{" "}
          {limits.maxActiveSearchProfiles === 1 ? "aktivní profil" : "aktivní profily"}. Další
          profily můžete vytvořit a přepínat mezi nimi aktivací.
        </Alert>
      )}
    </div>
  );
}
