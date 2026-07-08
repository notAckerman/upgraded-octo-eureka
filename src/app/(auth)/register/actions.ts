"use server";

import { signIn } from "@/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function register(_prev: any, formData: FormData) {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Некорректные данные" };

  const exists = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return { error: "Пользователь уже существует" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await db.user.create({ data: { email: parsed.data.email, passwordHash } });

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: "/dashboard",
  });
}
