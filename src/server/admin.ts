import "server-only";
import { auth } from "@/auth";
import { db } from "@/lib/db";

/** Throws unless the current session belongs to an ADMIN. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("forbidden");
  }
  return session.user.id;
}

export async function getAdminStats() {
  await requireAdmin();

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [userCount, paidAgg, usageAgg, openTickets] = await Promise.all([
    db.user.count(),
    db.payment.aggregate({
      where: { status: "PAID", createdAt: { gte: since } },
      _sum: { amountRub: true },
      _count: { _all: true },
    }),
    db.usageLog.aggregate({
      where: { createdAt: { gte: since } },
      _sum: { cost: true, upstreamCost: true },
      _count: { _all: true },
    }),
    db.ticket.count({ where: { status: "OPEN" } }),
  ]);

  const revenue = Number(usageAgg._sum.cost ?? 0);
  const upstream = Number(usageAgg._sum.upstreamCost ?? 0);

  return {
    userCount,
    deposits30d: Number(paidAgg._sum.amountRub ?? 0),
    paymentCount30d: paidAgg._count._all,
    requests30d: usageAgg._count._all,
    revenue30d: revenue,
    margin30d: revenue - upstream,
    openTickets,
  };
}

export async function getAdminUsers() {
  await requireAdmin();
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      balance: true,
      createdAt: true,
      _count: { select: { keys: true, usage: true } },
    },
  });
  return users.map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    balance: Number(u.balance),
    createdAt: u.createdAt.toISOString(),
    keyCount: u._count.keys,
    requestCount: u._count.usage,
  }));
}

export async function getAdminModels() {
  await requireAdmin();
  const models = await db.aiModel.findMany({
    orderBy: [{ provider: "asc" }, { name: "asc" }],
  });
  return models.map((m) => ({
    id: m.id,
    slug: m.slug,
    name: m.name,
    provider: m.provider,
    ctx: m.ctx,
    enabled: m.enabled,
    inRub1M: Number(m.inRub1M),
    outRub1M: Number(m.outRub1M),
  }));
}

export async function getAdminPayments(take = 50) {
  await requireAdmin();
  const payments = await db.payment.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: { user: { select: { email: true } } },
  });
  return payments.map((p) => ({
    id: p.id,
    email: p.user.email,
    method: p.method,
    amountRub: Number(p.amountRub),
    status: p.status,
    externalId: p.externalId,
    createdAt: p.createdAt.toISOString(),
  }));
}

export async function getAdminTickets() {
  await requireAdmin();
  const tickets = await db.ticket.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      user: { select: { email: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  return tickets.map((t) => ({
    id: t.id,
    email: t.user.email,
    subject: t.subject,
    category: t.category,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
    messages: t.messages.map((m) => ({
      id: m.id,
      fromRole: m.fromRole,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
  }));
}
