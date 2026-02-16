import { prisma } from "@/lib/prisma";
import { AttendanceStatusLabel } from "@/components/AttendanceStatusLabel";
import { AttendanceCorrectionForm } from "@/components/AttendanceCorrectionForm";

export default async function TeacherDashboardPage() {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const lessons = await prisma.lesson.findMany({
    where: {
      startTime: {
        gte: new Date(`${todayStr}T00:00:00`),
        lt: new Date(`${todayStr}T23:59:59`),
      },
    },
    include: {
      class: {
        include: { students: true },
      },
      attendances: {
        include: { student: true },
      },
    },
    orderBy: { startTime: "asc" },
  });

  // 各授業で、クラス全員の出席状況を表示（未記録は欠席として表示）
  const lessonsWithAllStudents = lessons.map((lesson) => {
    const attendanceMap = new Map(
      lesson.attendances.map((a) => [a.studentId, a])
    );
    const allStudents = lesson.class.students;
    const attendances = allStudents.map((student) => {
      const att = attendanceMap.get(student.id);
      return (
        att ?? {
          id: "",
          lessonId: lesson.id,
          studentId: student.id,
          student,
          checkIn: null,
          checkOut: null,
          status: "ABSENT" as const,
          correctionReason: null,
          updatedBy: null,
        }
      );
    });
    return { ...lesson, attendances };
  });

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-800">
        教員ダッシュボード
      </h1>

      {lessons.length === 0 ? (
        <p className="text-slate-500">本日の授業はありません</p>
      ) : (
        <div className="space-y-8">
          {lessonsWithAllStudents.map((lesson) => (
            <section
              key={lesson.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="mb-4 text-lg font-semibold text-slate-800">
                {lesson.name}（{lesson.class.name}）
              </h2>
              <p className="mb-6 text-sm text-slate-500">
                {new Date(lesson.startTime).toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                ～
                {new Date(lesson.endTime).toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-2 text-left text-sm font-medium text-slate-600">
                        学生
                      </th>
                      <th className="pb-2 text-left text-sm font-medium text-slate-600">
                        学籍番号
                      </th>
                      <th className="pb-2 text-left text-sm font-medium text-slate-600">
                        入室
                      </th>
                      <th className="pb-2 text-left text-sm font-medium text-slate-600">
                        退室
                      </th>
                      <th className="pb-2 text-left text-sm font-medium text-slate-600">
                        ステータス
                      </th>
                      <th className="pb-2 text-left text-sm font-medium text-slate-600">
                        修正
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lesson.attendances.map((att) => (
                      <tr
                        key={att.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-3">{att.student.name}</td>
                        <td className="py-3 text-slate-500">
                          {att.student.studentNo ?? "-"}
                        </td>
                        <td className="py-3 text-sm">
                          {att.checkIn
                            ? new Date(att.checkIn).toLocaleTimeString(
                                "ja-JP",
                                { hour: "2-digit", minute: "2-digit" }
                              )
                            : "-"}
                        </td>
                        <td className="py-3 text-sm">
                          {att.checkOut
                            ? new Date(att.checkOut).toLocaleTimeString(
                                "ja-JP",
                                { hour: "2-digit", minute: "2-digit" }
                              )
                            : "-"}
                        </td>
                        <td className="py-3">
                          <AttendanceStatusLabel status={att.status} />
                        </td>
                        <td className="py-3">
                          <AttendanceCorrectionForm
                            attendanceId={att.id}
                            currentStatus={att.status}
                            lessonId={lesson.id}
                            studentId={att.studentId}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
