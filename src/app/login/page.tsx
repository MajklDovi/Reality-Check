import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LoadingState,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Přihlášení",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Přihlášení</CardTitle>
          <CardDescription>Přihlaste se ke svému účtu Reality Check.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingState />}>
            <LoginForm />
          </Suspense>
          <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Nemáte účet?{" "}
            <Link
              href="/register"
              className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Zaregistrujte se
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
