"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

export type ActionResult = { success: true } | { success: false; error: string };

export async function registerAction(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Neplatná data formuláře" };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "Účet s tímto e-mailem již existuje" };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      profile: { create: {} },
    },
  });

  await signIn("credentials", { email, password, redirect: false });
  return { success: true };
}

export async function loginAction(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Neplatná data formuláře" };
  }

  try {
    await signIn("credentials", { ...parsed.data, redirect: false });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError && error.type === "CredentialsSignin") {
      return { success: false, error: "Nesprávný e-mail nebo heslo" };
    }
    throw error;
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
