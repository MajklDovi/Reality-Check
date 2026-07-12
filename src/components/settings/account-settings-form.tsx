"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateAccountSettingsAction } from "@/actions/profile";
import { accountSettingsSchema, type AccountSettingsInput } from "@/lib/validations/profile";
import { Alert, Button, Input, Select } from "@/components/ui";

const languageOptions = [
  { value: "cs", label: "Čeština" },
  { value: "sk", label: "Slovenčina" },
  { value: "en", label: "English" },
];

export interface AccountSettingsFormProps {
  defaultValues: AccountSettingsInput;
}

export function AccountSettingsForm({ defaultValues }: AccountSettingsFormProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccountSettingsInput>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues,
  });

  const onSubmit = async (data: AccountSettingsInput) => {
    setStatus("idle");
    setServerError(null);
    const result = await updateAccountSettingsAction(data);
    if (result.success) {
      setStatus("success");
    } else {
      setStatus("error");
      setServerError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {status === "success" && <Alert variant="success">Nastavení bylo uloženo.</Alert>}
      {status === "error" && serverError && <Alert variant="error">{serverError}</Alert>}
      <Input label="Jméno" type="text" error={errors.name?.message} {...register("name")} />
      <Select
        label="Jazyk"
        options={languageOptions}
        error={errors.language?.message}
        {...register("language")}
      />
      <div>
        <Button type="submit" isLoading={isSubmitting}>
          Uložit nastavení
        </Button>
      </div>
    </form>
  );
}
