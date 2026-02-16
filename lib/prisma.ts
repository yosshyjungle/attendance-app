import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// 開発時のホットリロードで複数インスタンスが作成されるのを防ぐ（接続プール枯渇対策）
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
// max: 1 で接続数を最小化（Supabase Session mode の pool_size 制限対策）
const adapter = new PrismaPg({ connectionString, max: 1 });
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
