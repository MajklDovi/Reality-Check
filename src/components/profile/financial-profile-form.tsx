"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserProfileAction } from "@/actions/profile";
import { userProfileSchema, type UserProfileInput } from "@/lib/validations/profile";
import { Alert, Button, Input } from "@/components/ui";

export interface FinancialProfileFormProps {
  defaultValues: {
    householdIncome?: number;
    availableSavings?: number;
    maximumMonthlyPayment?: number;
  };
}

export function FinancialProfileForm({ defaultValues }: FinancialProfileFormProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserProfileInput>({
    resolver: zodResolver(userProfileSchema),
    defaultValues,
  });

  const onSubmit = async (data: UserProfileInput) => {
    setStatus("idle");
    setServerError(null);
    const result = await updateUserProfileAction(data);
    if (result.success) {
      setStatus("success");
    } else {
      setStatus("error");
      setServerError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {status === "success" && <Alert variant="success">Finanční profil byl uložen.</Alert>}
      {status === "error" && serverError && <Alert variant="error">{serverError}</Alert>}
      <Input
        label="Měsíční příjem domácnosti (Kč)"
        type="number"
        min={0}
        step={1000}
        placeholder="např. 65 000"
        hint="Čistý měsíční příjem všech členů domácnosti."
        error={errors.householdIncome?.message}
        {...register("householdIncome", {
          setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)),
        })}
      />
      <Input
        label="Dostupné úspory (Kč)"
        type="number"
        min={0}
        step={10000}
        placeholder="např. 800 000"
        hint="Prostředky použitelné na akontaci a poplatky."
        error={errors.availableSavings?.message}
        {...register("availableSavings", {
          setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)),
        })}
      />
      <Input
        label="Maximální měsíční splátka (Kč)"
        type="number"
        min={0}
        step={500}
        placeholder="např. 25 000"
        hint="Kolik jste ochotni měsíčně splácet."
        error={errors.maximumMonthlyPayment?.message}
        {...register("maximumMonthlyPayment", {
          setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)),
        })}
      />
      <div>
        <Button type="submit" isLoading={isSubmitting}>
          Uložit profil
        </Button>
      </div>
    </form>
  );
}
