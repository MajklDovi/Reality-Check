"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginAction } from "@/actions/auth";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Alert, Button, Input } from "@/components/ui";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    const result = await loginAction(data);
    if (result.success) {
      const callbackUrl = searchParams.get("callbackUrl");
      router.push(callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard");
      router.refresh();
    } else {
      setServerError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {serverError && <Alert variant="error">{serverError}</Alert>}
      <Input
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="jan.novak@email.cz"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label="Heslo"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password")}
      />
      <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
        Přihlásit se
      </Button>
    </form>
  );
}
