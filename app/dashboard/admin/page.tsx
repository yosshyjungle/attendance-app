import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DeleteClassButton } from "@/components/DeleteClassButton";

export default async function AdminDashboardPage() {
  const [organizations, classes, students, lessons] = await Promise.all([
    prisma.organization.findMany({ include: { _count: { select: { classes: true } } } }),
    prisma.class.findMany({
      include: {
        _count: { select: { students: true, lessons: true } },
        organization: true,
      },
    }),
    prisma.student.findMany({
      include: { class: true },
      take: 10,
    }),
    prisma.lesson.findMany({
      include: { class: true },
      orderBy: { startTime: "desc" },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-800">
        管理者ダッシュボード
      </h1>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">組織</h3>
          <p className="text-2xl font-bold text-slate-800">
            {organizations.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">クラス</h3>
          <p className="text-2xl font-bold text-slate-800">{classes.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">学生</h3>
          <p className="text-2xl font-bold text-slate-800">
            {await prisma.student.count()}
          </p>
        </div>
      </div>

      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">クラス一覧</h2>
          <Link
            href="/dashboard/admin/students/new"
            className="mr-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            学生登録
          </Link>
          <Link
            href="/dashboard/admin/classes/new"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            新規作成
          </Link>
        </div>
        {classes.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-slate-500">
            クラスがありません。組織を作成してからクラスを追加してください。
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                    クラス名
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                    組織
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                    学生数
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                    授業数
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {classes.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100">
                    <td className="px-4 py-3">{c.name}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {c.organization.name}
                    </td>
                    <td className="px-4 py-3">{c._count.students}</td>
                    <td className="px-4 py-3">{c._count.lessons}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <Link
                          href={`/dashboard/admin/classes/${c.id}/edit`}
                          className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          編集
                        </Link>
                        <DeleteClassButton
                          classId={c.id}
                          className={c.name}
                          studentCount={c._count.students}
                          lessonCount={c._count.lessons}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">授業一覧</h2>
          <Link
            href="/dashboard/admin/lessons/new"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            新規作成
          </Link>
        </div>
        {lessons.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-slate-500">
            授業がありません
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                    授業名
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                    クラス
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                    開始
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                    QR
                  </th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((l) => (
                  <tr key={l.id} className="border-b border-slate-100">
                    <td className="px-4 py-3">{l.name}</td>
                    <td className="px-4 py-3 text-slate-500">{l.class.name}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(l.startTime).toLocaleString("ja-JP")}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/admin/lessons/${l.id}/qr`}
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        QR表示
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
