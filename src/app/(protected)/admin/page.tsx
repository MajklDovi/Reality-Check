import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Administrace",
};

export default async function AdminPage() {
  const [userCount, propertyCount, listingCount, sourceCount, analysisCount, users, sources] =
    await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.propertyListing.count(),
      prisma.listingSource.count(),
      prisma.aIAnalysis.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      }),
      prisma.listingSource.findMany({ orderBy: { name: "asc" } }),
    ]);

  const stats = [
    { label: "Uživatelé", value: userCount },
    { label: "Nemovitosti", value: propertyCount },
    { label: "Inzeráty", value: listingCount },
    { label: "Zdroje", value: sourceCount },
    { label: "AI analýzy", value: analysisCount },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Administrace</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Přehled systému — uživatelé, data a zdroje inzerátů.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
          <CardTitle>Poslední uživatelé</CardTitle>
          <CardDescription>10 naposledy registrovaných účtů.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th className="pr-4 pb-2 font-medium">Jméno</th>
                  <th className="pr-4 pb-2 font-medium">E-mail</th>
                  <th className="pr-4 pb-2 font-medium">Role</th>
                  <th className="pb-2 font-medium">Registrace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-3 pr-4 font-medium text-zinc-900 dark:text-zinc-100">
                      {user.name ?? "—"}
                    </td>
                    <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">{user.email}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={user.role === "ADMIN" ? "info" : "default"}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 text-zinc-600 dark:text-zinc-400">
                      {user.createdAt.toLocaleDateString("cs-CZ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Zdroje inzerátů</CardTitle>
            <CardDescription className="mt-1">
              Realitní portály evidované v systému.
            </CardDescription>
          </div>
          <Link href="/admin/sources">
            <Button variant="outline" size="sm">
              Spravovat zdroje
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Žádné zdroje. Spusťte seed skript: <code>npm run db:seed</code>
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
              {sources.map((source) => (
                <li key={source.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{source.name}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{source.domain}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{source.integrationType}</Badge>
                    <Badge variant={source.isActive ? "success" : "danger"}>
                      {source.isActive ? "Aktivní" : "Neaktivní"}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
