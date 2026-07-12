import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  PRIORITY_LEVELS,
  criterionLabel,
  dispositionLabel,
  levelFromPreference,
  preferenceValueLabel,
  propertyTypeLabel,
  purposeLabel,
  transportModeLabel,
} from "@/lib/search-criteria";
import {
  computeProfileCompleteness,
  formatCzk,
  toPlainSearchProfile,
} from "@/lib/search-profile-utils";
import { ProfileActions } from "@/components/search-profiles/profile-actions";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Detail profilu",
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <dt className="text-sm text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-right text-sm font-medium text-zinc-900 dark:text-zinc-100">{value}</dd>
    </div>
  );
}

export default async function SearchProfileDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ info?: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  const { info } = await searchParams;

  const profile = await prisma.searchProfile.findFirst({
    where: { id, userId: session!.user.id },
    include: { preferences: true },
  });
  if (!profile) notFound();

  const plain = toPlainSearchProfile(profile);
  const completeness = computeProfileCompleteness(plain, profile.preferences);
  const priorityLabel = (priority: number, isRequired: boolean) =>
    PRIORITY_LEVELS.find((l) => l.value === levelFromPreference(priority, isRequired))?.label;

  const budgetRows: [string, number | null][] = [
    ["Ideální cena", plain.idealPrice],
    ["Maximální cena", plain.maximumPrice],
    ["Vlastní úspory", plain.ownSavings],
    ["Plánovaná hypotéka", plain.plannedMortgage],
    ["Čistý měsíční příjem", plain.netMonthlyIncome],
    ["Stávající měsíční splátky", plain.existingMonthlyPayments],
    ["Maximální přijatelná splátka", plain.maximumMonthlyPayment],
    ["Finanční rezerva po koupi", plain.financialReserve],
    ["Rozpočet na rekonstrukci", plain.renovationBudget],
    ["Rozpočet na zařízení", plain.furnishingBudget],
  ];

  return (
    <div className="flex flex-col gap-6">
      {info && <Alert variant="success">{info}</Alert>}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{profile.name}</h1>
            {profile.isDefault && <Badge variant="info">Výchozí</Badge>}
            <Badge variant={profile.isActive ? "success" : "default"}>
              {profile.isActive ? "Aktivní" : "Neaktivní"}
            </Badge>
          </div>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">{purposeLabel(plain.purpose)}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link href="/search-profiles">
            <Button variant="ghost" size="sm">
              ← Všechny profily
            </Button>
          </Link>
          <Link href={`/search-profiles/${profile.id}/edit`}>
            <Button size="sm">Upravit profil</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Progress value={completeness.percent} label="Vyplněnost profilu" />
          <div className="mt-4 flex flex-wrap gap-2">
            {completeness.sections.map((section) => (
              <Badge key={section.key} variant={section.done ? "success" : "outline"}>
                {section.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rozpočet</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {budgetRows.map(([label, value]) => (
                <DetailRow key={label} label={label} value={formatCzk(value)} />
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nemovitost</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="mb-1.5 text-sm text-zinc-500 dark:text-zinc-400">Typy nemovitosti</p>
              <div className="flex flex-wrap gap-1.5">
                {plain.propertyTypes.length > 0 ? (
                  plain.propertyTypes.map((type) => (
                    <Badge key={type} variant="default">
                      {propertyTypeLabel(type)}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-zinc-400">Neurčeno</span>
                )}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-sm text-zinc-500 dark:text-zinc-400">Dispozice</p>
              <div className="flex flex-wrap gap-1.5">
                {plain.dispositions.length > 0 ? (
                  plain.dispositions.map((d) => (
                    <Badge key={d} variant="default">
                      {dispositionLabel(d)}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-zinc-400">Nezáleží</span>
                )}
              </div>
            </div>
            <dl className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <DetailRow
                label="Výměra"
                value={
                  plain.minimumArea || plain.maximumArea
                    ? `${plain.minimumArea ?? "?"} – ${plain.maximumArea ?? "?"} m²`
                    : "—"
                }
              />
              <DetailRow
                label="Počet pokojů"
                value={
                  plain.minimumRooms || plain.maximumRooms
                    ? `${plain.minimumRooms ?? "?"} – ${plain.maximumRooms ?? "?"}`
                    : "—"
                }
              />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lokalita</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <DetailRow label="Kraje" value={plain.preferredRegions.join(", ") || "Bez omezení"} />
              <DetailRow label="Města" value={plain.preferredCities.join(", ") || "—"} />
              <DetailRow label="Městské části" value={plain.preferredCityParts.join(", ") || "—"} />
              <DetailRow
                label="Vyloučené lokality"
                value={plain.excludedLocations.join(", ") || "—"}
              />
              <DetailRow label="Cíl dojíždění" value={plain.commuteDestination || "—"} />
              <DetailRow
                label="Max. čas dojíždění"
                value={plain.maximumCommuteMinutes ? `${plain.maximumCommuteMinutes} min` : "—"}
              />
              <DetailRow
                label="Způsob dopravy"
                value={plain.transportMode ? transportModeLabel(plain.transportMode) : "—"}
              />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kritéria a priority</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.preferences.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Žádná kritéria — doplňte je v úpravě profilu.
              </p>
            ) : (
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {[...profile.preferences]
                  .sort(
                    (a, b) => Number(b.isRequired) - Number(a.isRequired) || b.priority - a.priority
                  )
                  .map((preference) => (
                    <li
                      key={preference.id}
                      className="flex items-center justify-between gap-3 py-2"
                    >
                      <span className="text-sm text-zinc-900 dark:text-zinc-100">
                        {criterionLabel(preference.key)}
                        {preference.value !== "true" && (
                          <span className="text-zinc-500 dark:text-zinc-400">
                            {" "}
                            — {preferenceValueLabel(preference.key, preference.value)}
                          </span>
                        )}
                      </span>
                      <Badge variant={preference.isRequired ? "danger" : "default"}>
                        {priorityLabel(preference.priority, preference.isRequired)}
                      </Badge>
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Správa profilu</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileActions
            profileId={profile.id}
            profileName={profile.name}
            isActive={profile.isActive}
            isDefault={profile.isDefault}
            redirectAfterDelete
          />
        </CardContent>
      </Card>
    </div>
  );
}
