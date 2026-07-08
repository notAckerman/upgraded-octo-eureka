"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/server/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function toggleModel(modelId: string, enabled: boolean) {
  await requireAdmin();
  await db.aiModel.update({
    where: { id: modelId },
    data: { enabled },
  });
  revalidatePath("/admin/models");
  revalidatePath("/dashboard/models");
  return { ok: true };
}

const priceSchema = z.object({
  modelId: z.string().min(1),
  inRub1M: z.coerce.number().min(0).max(1_000_000),
  outRub1M: z.coerce.number().min(0).max(1_000_000),
});

export async function updateModelPricing(formData: FormData) {
  await requireAdmin();
  const parsed = priceSchema.safeParse({
    modelId: formData.get("modelId"),
    inRub1M: formData.get("inRub1M"),
    outRub1M: formData.get("outRub1M"),
  });
  if (!parsed.success) return { error: "invalid" as const };

  await db.aiModel.update({
    where: { id: parsed.data.modelId },
    data: {
      inRub1M: parsed.data.inRub1M,
      outRub1M: parsed.data.outRub1M,
    },
  });
  revalidatePath("/admin/models");
  revalidatePath("/dashboard/models");
  return { ok: true };
}

const adjustSchema = z.object({
  userId: z.string().min(1),
  amountRub: z.coerce
    .number()
    .refine((v) => v !== 0, "non-zero")
    .refine((v) => Math.abs(v) <= 1_000_000, "too-large"),
});

export async function adjustBalance(formData: FormData) {
  await requireAdmin();
  const parsed = adjustSchema.safeParse({
    userId: formData.get("userId"),
    amountRub: formData.get("amountRub"),
  });
  if (!parsed.success) return { error: "invalid" as const };

  await db.$transaction([
    db.user.update({
      where: { id: parsed.data.userId },
      data: { balance: { increment: parsed.data.amountRub } },
    }),
    db.ledger.create({
      data: {
        userId: parsed.data.userId,
        type: "ADJUST",
        amountRub: parsed.data.amountRub,
      },
    }),
  ]);

  revalidatePath("/admin/users");
  return { ok: true };
}

const replySchema = z.object({
  ticketId: z.string().min(1),
  body: z.string().trim().min(1).max(4000),
});

export async function adminReplyToTicket(formData: FormData) {
  await requireAdmin();
  const parsed = replySchema.safeParse({
    ticketId: formData.get("ticketId"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: "invalid" as const };

  await db.$transaction([
    db.ticketMessage.create({
      data: {
        ticketId: parsed.data.ticketId,
        fromRole: "ADMIN",
        body: parsed.data.body,
      },
    }),
    db.ticket.update({
      where: { id: parsed.data.ticketId },
      data: { status: "ANSWERED" },
    }),
  ]);

  revalidatePath("/admin/tickets");
  revalidatePath("/dashboard/support");
  return { ok: true };
}

export async function closeTicket(ticketId: string) {
  await requireAdmin();
  await db.ticket.update({
    where: { id: ticketId },
    data: { status: "CLOSED" },
  });
  revalidatePath("/admin/tickets");
  revalidatePath("/dashboard/support");
  return { ok: true };
}
