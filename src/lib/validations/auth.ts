import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Zadejte platný e-mail"),
  password: z.string().min(1, "Zadejte heslo"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Jméno musí mít alespoň 2 znaky").max(100),
    email: z.email("Zadejte platný e-mail"),
    password: z.string().min(8, "Heslo musí mít alespoň 8 znaků").max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hesla se neshodují",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
