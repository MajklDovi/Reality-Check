"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerAction } from "@/actions/auth";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { Alert, Button, Input } from "@/components/ui";

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    const result = await registerAction(data);
    if (result.success) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setServerError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {serverError && <Alert variant="error">{serverError}</Alert>}
      <Input
        label="Jméno"
        type="text"
        autoComplete="name"
        placeholder="Jan Novák"
        error={errors.name?.message}
        {...register("name")}
      />
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
        autoComplete="new-password"
        placeholder="Alespoň 8 znaků"
        error={errors.password?.message}
        {...register("password")}
      />
      <Input
        label="Heslo znovu"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
        Vytvořit účet
      </Button>
    </form>
  );
}
