// prisma/seed.ts — NeonLLM seed data
// Run: npx tsx prisma/seed.ts

import { PrismaClient, Role, PayMethod, PayStatus, LedgerType } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// ─── Helpers ────────────────────────────────────────────────────────────────

function randomId(): string {
  return randomBytes(12).toString("hex");
}

function randomKeyHash(): string {
  return randomBytes(32).toString("hex");
}

function randomPrefix(): string {
  return "sk-" + randomBytes(4).toString("hex").slice(0, 8);
}

function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function weekdayFactor(date: Date): number {
  const day = date.getDay();
  // Weekdays are busier
  if (day === 0 || day === 6) return 0.6;
  if (day === 5) return 0.85;
  return 1.0;
}

// ─── Models data ────────────────────────────────────────────────────────────

const MODELS = [
  {
    slug: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    upstreamModel: "gpt-4o",
    inRub1M: 16,
    outRub1M: 48,
    baseInUsd1M: 2.5,
    baseOutUsd1M: 10,
    ctx: 128000,
  },
  {
    slug: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    upstreamModel: "gpt-4o-mini",
    inRub1M: 2.4,
    outRub1M: 9.6,
    baseInUsd1M: 0.15,
    baseOutUsd1M: 0.6,
    ctx: 128000,
  },
  {
    slug: "claude-opus-4-8",
    name: "Claude Opus 4.8",
    provider: "anthropic",
    upstreamModel: "claude-opus-4-8",
    inRub1M: 12,
    outRub1M: 36,
    baseInUsd1M: 15,
    baseOutUsd1M: 75,
    ctx: 200000,
  },
  {
    slug: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    provider: "anthropic",
    upstreamModel: "claude-sonnet-4-6",
    inRub1M: 4,
    outRub1M: 12,
    baseInUsd1M: 3,
    baseOutUsd1M: 15,
    ctx: 200000,
  },
  {
    slug: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
    upstreamModel: "claude-haiku-4-5-20251001",
    inRub1M: 1.6,
    outRub1M: 8,
    baseInUsd1M: 0.8,
    baseOutUsd1M: 4,
    ctx: 200000,
  },
  {
    slug: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "openrouter",
    upstreamModel: "deepseek/deepseek-chat-v3-0324",
    inRub1M: 1.6,
    outRub1M: 6.4,
    baseInUsd1M: 0.27,
    baseOutUsd1M: 1.1,
    ctx: 131072,
  },
  {
    slug: "qwen-2.5-72b",
    name: "Qwen 2.5 72B",
    provider: "openrouter",
    upstreamModel: "qwen/qwen-2.5-72b-instruct",
    inRub1M: 2.4,
    outRub1M: 9.6,
    baseInUsd1M: 0.4,
    baseOutUsd1M: 1.6,
    ctx: 131072,
  },
  {
    slug: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "openrouter",
    upstreamModel: "google/gemini-2.5-pro-preview",
    inRub1M: 8,
    outRub1M: 32,
    baseInUsd1M: 1.25,
    baseOutUsd1M: 10,
    ctx: 1048576,
  },
  {
    slug: "mistral-large",
    name: "Mistral Large",
    provider: "openrouter",
    upstreamModel: "mistralai/mistral-large-2411",
    inRub1M: 4,
    outRub1M: 12,
    baseInUsd1M: 2,
    baseOutUsd1M: 6,
    ctx: 131072,
  },
];

// ─── Settings ───────────────────────────────────────────────────────────────

const SETTINGS: Record<string, string> = {
  usdRate: "92",
  defaultMarkup: "4",
  minTopupRub: "100",
  tgNotifyDeposits: "true",
  tgDailyDigest: "true",
};

// ─── Main seed ──────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.ticketMessage.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.usageLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.ledger.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.user.deleteMany();
  await prisma.aiModel.deleteMany();
  await prisma.setting.deleteMany();

  // ── Settings ──
  await prisma.setting.createMany({
    data: Object.entries(SETTINGS).map(([key, value]) => ({ key, value })),
  });
  console.log(`  Created ${Object.keys(SETTINGS).length} settings`);

  // ── Models ──
  await prisma.aiModel.createMany({
    data: MODELS.map((m) => ({ ...m, enabled: true })),
  });
  const models = await prisma.aiModel.findMany();
  console.log(`  Created ${models.length} models`);

  // ── Users ──
  const passwordHash = await bcrypt.hash("password123", 12);
  const adminHash = await bcrypt.hash(
    process.env.SEED_ADMIN_PASSWORD ?? "admin123",
    12
  );

  const admin = await prisma.user.create({
    data: {
      email: process.env.SEED_ADMIN_EMAIL ?? "admin@neonllm.dev",
      passwordHash: adminHash,
      role: Role.ADMIN,
      balance: 50000,
    },
  });

  const demoUsers = await Promise.all(
    [
      {
        email: "alice@example.com",
        passwordHash,
        balance: 12500,
      },
      {
        email: "bob@example.com",
        passwordHash,
        balance: 7800,
      },
      {
        email: "carol@example.com",
        passwordHash,
        balance: 3200,
      },
    ].map((u) =>
      prisma.user.create({
        data: { ...u, role: Role.USER },
      })
    )
  );

  const allUsers = [admin, ...demoUsers];
  console.log(
    `  Created admin + ${demoUsers.length} demo users (${allUsers.length} total)`
  );

  // ── API Keys (2 per user) ──
  const allKeys = [];
  for (const user of allUsers) {
    for (let i = 0; i < 2; i++) {
      const key = await prisma.apiKey.create({
        data: {
          userId: user.id,
          name: i === 0 ? "Primary" : "Secondary",
          prefix: randomPrefix(),
          keyHash: randomKeyHash(),
          rpm: 60,
        },
      });
      allKeys.push(key);
    }
  }
  console.log(`  Created ${allKeys.length} API keys`);

  // ── Payments + UsageLogs + Ledger (45 days) ──
  const paymentMethods: PayMethod[] = [PayMethod.LZT, PayMethod.CRYPTO, PayMethod.SBP];
  const usdRate = 92;
  let totalPayments = 0;
  let totalUsageLogs = 0;

  for (let dayOffset = 44; dayOffset >= 0; dayOffset--) {
    const date = daysAgo(dayOffset);
    const wFactor = weekdayFactor(date);
    // Mild growth trend: 0.8 -> 1.2 over 45 days
    const growthFactor = 0.8 + ((45 - dayOffset) / 45) * 0.4;
    const dailyRequests = Math.floor(
      (30 + Math.random() * 40) * wFactor * growthFactor
    );

    // Create 1-3 payments per day (weighted by growth)
    const numPayments = Math.floor(1 + Math.random() * 3 * growthFactor);
    for (let p = 0; p < numPayments; p++) {
      const user = allUsers[Math.floor(Math.random() * allUsers.length)];
      const amounts = [100, 500, 1000, 2000, 5000];
      const amountRub = amounts[Math.floor(Math.random() * amounts.length)];
      const method =
        paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      const payment = await prisma.payment.create({
        data: {
          userId: user.id,
          method,
          amountRub,
          status: PayStatus.PAID,
          externalId: `${method.toLowerCase()}_${randomId()}`,
          createdAt: new Date(
            date.getTime() +
              Math.floor(Math.random() * 12 * 60 * 60 * 1000)
          ), // random time during the day
        },
      });

      await prisma.ledger.create({
        data: {
          userId: user.id,
          type: LedgerType.DEPOSIT,
          amountRub,
          ref: payment.id,
          createdAt: payment.createdAt,
        },
      });
      totalPayments++;
    }

    // Create usage logs
    for (let r = 0; r < dailyRequests; r++) {
      const user = allUsers[Math.floor(Math.random() * allUsers.length)];
      const userKeys = allKeys.filter((k) => k.userId === user.id);
      const key = userKeys[Math.floor(Math.random() * userKeys.length)];
      const model = models[Math.floor(Math.random() * models.length)];

      // Token counts vary by model size
      const inTok = Math.floor(
        200 + Math.random() * 3000 * (model.ctx > 100000 ? 1.5 : 0.8)
      );
      const outTok = Math.floor(
        50 + Math.random() * 1500 * (model.ctx > 100000 ? 1.3 : 0.7)
      );

      const cost =
        (inTok * Number(model.inRub1M) + outTok * Number(model.outRub1M)) /
        1_000_000;
      const upstreamCost =
        ((inTok * Number(model.baseInUsd1M) +
          outTok * Number(model.baseOutUsd1M)) /
          1_000_000) *
        usdRate;

      const status =
        Math.random() > 0.05 ? "success" : "error";

      await prisma.usageLog.create({
        data: {
          userId: user.id,
          keyId: key.id,
          modelId: model.id,
          inTok,
          outTok,
          cost,
          upstreamCost,
          ms: Math.floor(200 + Math.random() * 3000),
          status,
          estimated: Math.random() > 0.8,
          createdAt: new Date(
            date.getTime() +
              Math.floor(Math.random() * 24 * 60 * 60 * 1000)
          ),
        },
      });

      // Ledger CHARGE entry for successful requests
      if (status === "success") {
        await prisma.ledger.create({
          data: {
            userId: user.id,
            type: LedgerType.CHARGE,
            amountRub: -cost,
            createdAt: new Date(
              date.getTime() +
                Math.floor(Math.random() * 24 * 60 * 60 * 1000)
            ),
          },
        });
      }

      totalUsageLogs++;
    }

    if (dayOffset % 10 === 0) {
      console.log(`  Seeded day ${45 - dayOffset}/45 (${date.toISOString().slice(0, 10)})...`);
    }
  }

  console.log(`  Created ${totalPayments} payments`);
  console.log(`  Created ${totalUsageLogs} usage logs`);
  console.log("\nSeed complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
