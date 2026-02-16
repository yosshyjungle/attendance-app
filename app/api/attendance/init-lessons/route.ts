import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PERIOD_TIMES: Record<number, { start: string; end: string }> = {
  1: { start: "09:30", end: "10:15" },
  2: { start: "10:25", end: "11:10" },
  3: { start: "11:20", end: "12:05" },
  4: { start: "12:15", end: "13:00" },
};

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { date, classId } = await request.json();
    if (!date || !classId) {
      return NextResponse.json(
        { error: "date and classId are required" },
        { status: 400 }
      );
    }

    const lessonDate = new Date(date);
    const semester =
      lessonDate.getMonth() >= 3 && lessonDate.getMonth() <= 8
        ? "FIRST"
        : "SECOND";
    const dayOfWeek = lessonDate.getDay() === 0 ? 6 : lessonDate.getDay() - 1;

    const slots = await prisma.timetableSlot.findMany({
      where: { classId, dayOfWeek, semester },
      include: { subject: true },
      orderBy: { period: "asc" },
    });

    const dayStart = new Date(lessonDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(lessonDate);
    dayEnd.setHours(23, 59, 59, 999);

    const existing = await prisma.lesson.findMany({
      where: {
        classId,
        date: { gte: dayStart, lte: dayEnd },
      },
    });

    if (existing.length > 0) {
      return NextResponse.json({
        lessons: existing.map((l) => ({ id: l.id, period: l.period, name: l.name })),
      });
    }

    const lessons = [];
    const toCreate: { period: number; subjectId: string | null; subject: { name: string } }[] =
      slots.length > 0
        ? slots.map((s) => ({
            period: s.period,
            subjectId: s.subjectId,
            subject: s.subject,
          }))
        : [1, 2, 3, 4].map((p) => ({
            period: p,
            subjectId: null,
            subject: { name: `${p}限` },
          }));

    for (const slot of toCreate) {
      const period = slot.period;
      const times = PERIOD_TIMES[period] ?? PERIOD_TIMES[1];
      const start = new Date(`${date}T${times.start}`);
      const end = new Date(`${date}T${times.end}`);

      const lesson = await prisma.lesson.create({
        data: {
          classId,
          date: lessonDate,
          period,
          name: slot.subject?.name ?? `${period}限`,
          subjectId: slot.subjectId,
          startTime: start,
          endTime: end,
        },
      });
      lessons.push(lesson);
    }

    return NextResponse.json({
      lessons: lessons.map((l) => ({ id: l.id, period: l.period, name: l.name })),
    });
  } catch (error) {
    console.error("Init lessons error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
