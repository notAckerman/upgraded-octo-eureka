"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createHash, randomBytes } from "crypto";
import { z } from "zod";

const createKeySchema = z.object({
  name: z.string().trim().min(1).max(64),
});

export async function createApiKey(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "unauthorized" as const };

  const parsed = createKeySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: "invalid" as const };

  const count = await db.apiKey.count({
    where: { userId: session.user.id, revoked: false },
  });
  if (count >= 10) return { error: "limit" as const };

  // Full key shown exactly once; only sha256 is stored.
  const secret = randomBytes(24).toString("base64url");
  const fullKey = `sk-np-${secret}`;
  const prefix = `sk-np-${secret.slice(0, 6)}…`;
  const keyHash = createHash("sha256").update(fullKey).digest("hex");

  await db.apiKey.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      prefix,
      keyHash,
      rpm: 60,
    },
  });

  revalidatePath("/dashboard/keys");
  return { fullKey };
}

export async function revokeApiKey(keyId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "unauthorized" as const };

  // Scoped update: only the owner can revoke.
  await db.apiKey.updateMany({
    where: { id: keyId, userId: session.user.id },
    data: { revoked: true },
  });

  revalidatePath("/dashboard/keys");
  return { ok: true };
}
