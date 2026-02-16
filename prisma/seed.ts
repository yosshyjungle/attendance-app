import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL required");
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  let org = await prisma.organization.findFirst({
    where: { name: "デモ学校" },
  });
  if (!org) {
    org = await prisma.organization.create({
      data: { name: "デモ学校" },
    });
  }

  let cls = await prisma.class.findFirst({
    where: { organizationId: org.id, name: "1年A組" },
  });
  if (!cls) {
    cls = await prisma.class.create({
      data: {
        organizationId: org.id,
        name: "1年A組",
      },
    });
  }

  const existingLesson = await prisma.lesson.findFirst({
    where: { qrCodeToken: "demo-lesson-token-001" },
  });
  if (!existingLesson) {
    const now = new Date();
    const lessonStart = new Date(now);
    lessonStart.setHours(9, 0, 0, 0);
    const lessonEnd = new Date(now);
    lessonEnd.setHours(10, 30, 0, 0);

    await prisma.lesson.create({
      data: {
        classId: cls.id,
        name: "国語",
        startTime: lessonStart,
        endTime: lessonEnd,
        qrCodeToken: "demo-lesson-token-001",
      },
    });
  }

  console.log("Seed completed.");
  console.log("QR入室URL: /scan/demo-lesson-token-001?action=in");
  console.log("QR退室URL: /scan/demo-lesson-token-001?action=out");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
