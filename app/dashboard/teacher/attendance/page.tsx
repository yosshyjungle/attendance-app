import { prisma } from "@/lib/prisma";
import { ensureLessonsForDate } from "@/lib/init-lessons";
import { AttendanceSheet } from "@/components/AttendanceSheet";

export default async function AttendanceInputPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; classId?: string }>;
}) {
  const params = await searchParams;
  const dateStr = params.date ?? new Date().toISOString().slice(0, 10);
  const selectedDate = new Date(dateStr);
  selectedDate.setHours(0, 0, 0, 0);

  const classes = await prisma.class.findMany({
    include: { organization: true },
    orderBy: { name: "asc" },
  });

  const selectedClassId = params.classId ?? classes[0]?.id;
  let students: { id: string; name: string; studentNo: string | null }[] = [];
  let lessons: { id: string; period: number; name: string }[] = [];
  let attendances: Map<string, { status: string; notes: string | null }> =
    new Map();

  if (selectedClassId) {
    students = await prisma.student.findMany({
      where: { classId: selectedClassId },
      orderBy: [{ studentNo: "asc" }, { name: "asc" }],
      select: { id: true, name: true, studentNo: true },
    });

    const dayStart = new Date(dateStr);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dateStr);
    dayEnd.setHours(23, 59, 59, 999);

    let existingLessons = await prisma.lesson.findMany({
      where: {
        classId: selectedClassId,
        startTime: { gte: dayStart, lte: dayEnd },
      },
      orderBy: { period: "asc" },
      select: { id: true, period: true, name: true },
    });

    if (existingLessons.length === 0) {
      lessons = await ensureLessonsForDate(dateStr, selectedClassId);
    } else {
      lessons = existingLessons;
    }

    if (lessons.length > 0) {
      const atts = await prisma.attendance.findMany({
        where: {
          lessonId: { in: lessons.map((l) => l.id) },
        },
      });
      for (const a of atts) {
        attendances.set(`${a.lessonId}-${a.studentId}`, {
          status: a.status,
          notes: a.notes,
        });
      }
    }
  }

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-800">
        出席入力（スプレッドシート形式）
      </h1>
      <p className="mb-4 text-sm text-slate-500">
        1=出席, 2=遅刻, 3=公欠, 4=早退, 空=欠席
      </p>
      <AttendanceSheet
        date={dateStr}
        classes={classes}
        selectedClassId={selectedClassId ?? ""}
        students={students}
        lessons={lessons}
        attendances={Object.fromEntries(attendances)}
      />
    </div>
  );
}
