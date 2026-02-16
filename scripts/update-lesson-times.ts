/**
 * 既存の授業レコードの時間を新しい時間割に更新するスクリプト
 * 実行: npx tsx scripts/update-lesson-times.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL required");
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const PERIOD_TIMES: Record<number, { start: string; end: string }> = {
  1: { start: "09:30", end: "10:15" },
  2: { start: "10:25", end: "11:10" },
  3: { start: "11:20", end: "12:05" },
  4: { start: "12:15", end: "13:00" },
};

async function main() {
  const lessons = await prisma.lesson.findMany();
  console.log(`Found ${lessons.length} lessons to update`);

  let updated = 0;
  for (const lesson of lessons) {
    const times = PERIOD_TIMES[lesson.period] ?? PERIOD_TIMES[1];
    const dateStr = lesson.date.toISOString().slice(0, 10);
    const start = new Date(`${dateStr}T${times.start}`);
    const end = new Date(`${dateStr}T${times.end}`);

    await prisma.lesson.update({
      where: { id: lesson.id },
      data: { startTime: start, endTime: end },
    });
    updated++;
    console.log(
      `Updated ${lesson.name} (${lesson.date.toISOString().slice(0, 10)} ${lesson.period}限): ${times.start}～${times.end}`
    );
  }

  console.log(`\nDone. Updated ${updated} lessons.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
