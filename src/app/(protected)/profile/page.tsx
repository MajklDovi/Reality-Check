import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FinancialProfileForm } from "@/components/profile/financial-profile-form";
import {
  Alert,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Můj profil",
};

export default async function ProfilePage() {
  const session = await auth();
  const userId = session!.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Můj profil</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Vaše finanční možnosti — základ pro AI hodnocení dostupnosti nemovitostí.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Účet</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div>
              <p className="text-zinc-500 dark:text-zinc-400">Jméno</p>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {user?.name ?? "Neuvedeno"}
              </p>
            </div>
            <div>
              <p className="text-zinc-500 dark:text-zinc-400">E-mail</p>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">{user?.email}</p>
            </div>
            <div>
              <p className="text-zinc-500 dark:text-zinc-400">Role</p>
              <Badge variant={user?.role === "ADMIN" ? "info" : "default"}>{user?.role}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Finanční profil</CardTitle>
            <CardDescription>
              Tyto údaje slouží pouze pro výpočet dostupnosti a nikdy je nesdílíme.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FinancialProfileForm
              defaultValues={{
                householdIncome: user?.profile?.householdIncome?.toNumber(),
                availableSavings: user?.profile?.availableSavings?.toNumber(),
                maximumMonthlyPayment: user?.profile?.maximumMonthlyPayment?.toNumber(),
              }}
            />
          </CardContent>
        </Card>
      </div>

      <Alert variant="info" title="Vyhledávací profily">
        Detailní správa vyhledávacích profilů (lokalita, dispozice, preference) bude dostupná v
        další fázi projektu.
      </Alert>
    </div>
  );
}
