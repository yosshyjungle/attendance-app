import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-8">
        <h1 className="mb-8 text-2xl font-bold text-slate-800">
          Smart Attendance QR
        </h1>
        <Link
          href="/dashboard"
          className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
        >
          ダッシュボードへ
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-8">
      <h1 className="mb-4 text-2xl font-bold text-slate-800">
        Smart Attendance QR
      </h1>
      <p className="mb-8 text-slate-600">出席管理Webシステム</p>
      <div className="flex gap-4">
        <Link
          href="/sign-in"
          className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
        >
          サインイン
        </Link>
        <Link
          href="/sign-up"
          className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
        >
          サインアップ
        </Link>
      </div>
    </div>
  );
}
