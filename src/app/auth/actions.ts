"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  createOperatorSession,
  deleteOperatorSession,
  validateOperatorCredentials,
} from "@/server/auth";

export type LoginActionState = {
  errors?: {
    username?: string[];
    password?: string[];
  };
  message?: string;
};

const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi").trim(),
  password: z.string().min(1, "Password wajib diisi"),
});

export async function loginAction(
  _state: LoginActionState | undefined,
  formData: FormData,
): Promise<LoginActionState | undefined> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  if (!validateOperatorCredentials(parsed.data.username, parsed.data.password)) {
    return {
      message: "Username atau password tidak sesuai.",
    };
  }

  await createOperatorSession(parsed.data.username);
  redirect("/dashboard");
}

export async function logoutAction() {
  await deleteOperatorSession();
  redirect("/auth");
}
