import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AttendanceStatusLabel } from "@/components/AttendanceStatusLabel";

export default async function StudentDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      class: true,
      attendances: {
        include: { lesson: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!student) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
        <p className="text-amber-800">
          学生として登録されていません。管理者に連絡してください。
        </p>
      </div>
    );
  }

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const todayAttendances = student.attendances.filter((a) => {
    const lessonDate = new Date(a.lesson.startTime)
      .toISOString()
      .slice(0, 10);
    return lessonDate === todayStr;
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        {student.name} さん
      </h1>
      <p className="mb-8 text-slate-600">{student.class.name}</p>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          当日の出席状況
        </h2>
        {todayAttendances.length === 0 ? (
          <p className="text-slate-500">本日の記録はありません</p>
        ) : (
          <div className="space-y-2">
            {todayAttendances.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
              >
                <span className="font-medium">{a.lesson.name}</span>
                <AttendanceStatusLabel status={a.status} />
                <span className="text-sm text-slate-500">
                  {a.checkIn
                    ? new Date(a.checkIn).toLocaleTimeString("ja-JP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          最近の出席記録
        </h2>
        <div className="space-y-2">
          {student.attendances.slice(0, 10).map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
            >
              <div>
                <span className="font-medium">{a.lesson.name}</span>
                <span className="ml-2 text-sm text-slate-500">
                  {new Date(a.lesson.startTime).toLocaleDateString("ja-JP")}
                </span>
              </div>
              <AttendanceStatusLabel status={a.status} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
