import Link from "next/link";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-800">ダッシュボード</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <Link
          href="/dashboard/student"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
        >
          <h2 className="mb-2 text-lg font-semibold text-slate-800">学生</h2>
          <p className="text-sm text-slate-600">
            QR入退室・出席状況の確認
          </p>
        </Link>
        <Link
          href="/dashboard/teacher"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
        >
          <h2 className="mb-2 text-lg font-semibold text-slate-800">教員</h2>
          <p className="text-sm text-slate-600">
            出席一覧・ステータス修正
          </p>
        </Link>
        <Link
          href="/dashboard/admin"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
        >
          <h2 className="mb-2 text-lg font-semibold text-slate-800">管理者</h2>
          <p className="text-sm text-slate-600">
            クラス・学生・時間割管理
          </p>
        </Link>
      </div>
    </div>
  );
}
