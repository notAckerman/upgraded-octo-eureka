import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let _client: PrismaClient | null = null;

function createClient(): PrismaClient {
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter });
}

export function getDb(): PrismaClient {
  if (!_client) {
    _client = globalForPrisma.prisma ?? createClient();
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = _client;
  }
  return _client;
}

// Lazy proxy for backward compatibility
export const db = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = getDb();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
