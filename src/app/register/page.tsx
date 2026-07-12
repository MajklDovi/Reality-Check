import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export const metadata: Metadata = {
  title: "Registrace",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Registrace</CardTitle>
          <CardDescription>
            Vytvořte si účet zdarma a začněte porovnávat nemovitosti.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Už máte účet?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Přihlaste se
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
