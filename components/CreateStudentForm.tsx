"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Class } from "@prisma/client";

export function CreateStudentForm({
  classes,
}: {
  classes: (Class & { organization: { name: string } })[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [studentNo, setStudentNo] = useState("");
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [clerkUserId, setClerkUserId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          studentNo: studentNo || undefined,
          classId,
          userId: clerkUserId || undefined,
        }),
      });
      if (res.ok) router.push("/dashboard/admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          クラス
        </label>
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          required
        >
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}（{cls.organization.name}）
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          氏名
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          学籍番号（任意）
        </label>
        <input
          type="text"
          value={studentNo}
          onChange={(e) => setStudentNo(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Clerk User ID（任意・ログイン連携用）
        </label>
        <input
          type="text"
          value={clerkUserId}
          onChange={(e) => setClerkUserId(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
          placeholder="user_xxxxx"
        />
        <p className="mt-1 text-xs text-slate-500">
          Clerkダッシュボードで確認できます。設定すると学生がログインしてQR入退室できます。
        </p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "登録中..." : "登録"}
      </button>
    </form>
  );
}
