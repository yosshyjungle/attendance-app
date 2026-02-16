import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="text-lg font-semibold text-slate-800">
            Smart Attendance QR
          </Link>
          <div className="flex gap-4">
            <Link
              href="/dashboard/student"
              className="text-slate-600 hover:text-indigo-600"
            >
              学生
            </Link>
            <Link
              href="/dashboard/teacher"
              className="text-slate-600 hover:text-indigo-600"
            >
              教員
            </Link>
            <Link
              href="/dashboard/admin"
              className="text-slate-600 hover:text-indigo-600"
            >
              管理者
            </Link>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
