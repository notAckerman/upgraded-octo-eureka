import "server-only";
import { db } from "@/lib/db";

// Every query in this file is scoped by userId. Never expose cross-user data.

export interface DailySpendPoint {
  date: string; // YYYY-MM-DD
  spend: number;
  requests: number;
}

export async function getOverview(userId: string) {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  since.setHours(0, 0, 0, 0);

  const [user, keyCount, agg, logs] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { balance: true, email: true },
    }),
    db.apiKey.count({ where: { userId, revoked: false } }),
    db.usageLog.aggregate({
      where: { userId, createdAt: { gte: since } },
      _sum: { cost: true, inTok: true, outTok: true },
      _count: { _all: true },
    }),
    db.usageLog.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { cost: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Bucket by day
  const buckets = new Map<string, { spend: number; requests: number }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), { spend: 0, requests: 0 });
  }
  for (const log of logs) {
    const key = log.createdAt.toISOString().slice(0, 10);
    const b = buckets.get(key);
    if (b) {
      b.spend += Number(log.cost);
      b.requests += 1;
    }
  }

  const daily: DailySpendPoint[] = Array.from(buckets.entries()).map(
    ([date, v]) => ({
      date,
      spend: Math.round(v.spend * 100) / 100,
      requests: v.requests,
    }),
  );

  return {
    balance: Number(user?.balance ?? 0),
    keyCount,
    spend30d: Number(agg._sum.cost ?? 0),
    requests30d: agg._count._all,
    tokens30d: (agg._sum.inTok ?? 0) + (agg._sum.outTok ?? 0),
    daily,
  };
}

export async function getRecentUsage(userId: string, limit = 10) {
  const rows = await db.usageLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      model: { select: { name: true, slug: true } },
      key: { select: { name: true, prefix: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    model: r.model.name,
    keyName: r.key.name,
    inTok: r.inTok,
    outTok: r.outTok,
    cost: Number(r.cost),
    ms: r.ms,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getUsagePage(userId: string, take = 50) {
  const [rows, agg] = await Promise.all([
    db.usageLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
      include: {
        model: { select: { name: true } },
        key: { select: { name: true, prefix: true } },
      },
    }),
    db.usageLog.aggregate({
      where: { userId },
      _sum: { cost: true, inTok: true, outTok: true },
      _count: { _all: true },
    }),
  ]);

  return {
    rows: rows.map((r) => ({
      id: r.id,
      model: r.model.name,
      keyName: r.key.name,
      inTok: r.inTok,
      outTok: r.outTok,
      cost: Number(r.cost),
      ms: r.ms,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    })),
    totals: {
      requests: agg._count._all,
      cost: Number(agg._sum.cost ?? 0),
      tokens: (agg._sum.inTok ?? 0) + (agg._sum.outTok ?? 0),
    },
  };
}

export async function getUserKeys(userId: string) {
  const keys = await db.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      prefix: true,
      rpm: true,
      revoked: true,
      lastUsedAt: true,
      createdAt: true,
    },
  });
  return keys.map((k) => ({
    ...k,
    lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
    createdAt: k.createdAt.toISOString(),
  }));
}

export async function getEnabledModels() {
  const models = await db.aiModel.findMany({
    where: { enabled: true },
    orderBy: [{ provider: "asc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      provider: true,
      ctx: true,
      inRub1M: true,
      outRub1M: true,
    },
  });
  return models.map((m) => ({
    ...m,
    inRub1M: Number(m.inRub1M),
    outRub1M: Number(m.outRub1M),
  }));
}

export async function getUserTickets(userId: string) {
  const tickets = await db.ticket.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  return tickets.map((t) => ({
    id: t.id,
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
