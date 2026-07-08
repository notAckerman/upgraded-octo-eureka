"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createTicketSchema = z.object({
  subject: z.string().trim().min(3).max(120),
  category: z.enum(["billing", "api", "other"]),
  body: z.string().trim().min(5).max(4000),
});

export async function createTicket(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "unauthorized" as const };

  const parsed = createTicketSchema.safeParse({
    subject: formData.get("subject"),
    category: formData.get("category"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: "invalid" as const };

  await db.ticket.create({
    data: {
      userId: session.user.id,
      subject: parsed.data.subject,
      category: parsed.data.category,
      status: "OPEN",
      messages: {
        create: {
          fromRole: "USER",
          body: parsed.data.body,
        },
      },
    },
  });

  revalidatePath("/dashboard/support");
  return { ok: true };
}

const replySchema = z.object({
  ticketId: z.string().min(1),
  body: z.string().trim().min(1).max(4000),
});

export async function replyToTicket(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "unauthorized" as const };

  const parsed = replySchema.safeParse({
    ticketId: formData.get("ticketId"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: "invalid" as const };

  // Verify ownership before writing.
  const ticket = await db.ticket.findFirst({
    where: { id: parsed.data.ticketId, userId: session.user.id },
    select: { id: true, status: true },
  });
  if (!ticket) return { error: "not_found" as const };
  if (ticket.status === "CLOSED") return { error: "closed" as const };

  await db.$transaction([
    db.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        fromRole: "USER",
        body: parsed.data.body,
      },
    }),
    db.ticket.update({
      where: { id: ticket.id },
      data: { status: "OPEN" },
    }),
  ]);

  revalidatePath("/dashboard/support");
  return { ok: true };
}
