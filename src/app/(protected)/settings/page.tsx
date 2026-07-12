import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountSettingsForm } from "@/components/settings/account-settings-form";
import { Alert, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export const metadata: Metadata = {
  title: "Nastavení",
};

export default async function SettingsPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({ where: { id: session!.user.id } });

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Nastavení</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">Správa účtu a předvoleb aplikace.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Účet</CardTitle>
          <CardDescription>Základní údaje vašeho účtu.</CardDescription>
        </CardHeader>
        <CardContent>
          <AccountSettingsForm
            defaultValues={{
              name: user?.name ?? "",
              language: (["cs", "sk", "en"].includes(user?.language ?? "")
                ? user!.language
                : "cs") as "cs" | "sk" | "en",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Předplatné</CardTitle>
          <CardDescription>Správa plánu a fakturace.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="info">
            Placené plány a správa předplatného budou dostupné v další fázi projektu. Nyní používáte
            plán FREE.
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
