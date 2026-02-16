"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-slate-800">
          Smart Attendance QR
        </Link>
        <div className="flex items-center gap-4">
          <SignedIn>
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
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                サインイン
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
