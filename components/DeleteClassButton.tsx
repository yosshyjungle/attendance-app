"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteClassButton({
  classId,
  className,
  studentCount,
  lessonCount,
}: {
  classId: string;
  className: string;
  studentCount: number;
  lessonCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasDependencies = studentCount > 0 || lessonCount > 0;

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/classes/${classId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "削除に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-red-600 hover:text-red-700"
      >
        削除
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h3 className="mb-2 text-lg font-semibold text-slate-800">
              クラスを削除しますか？
            </h3>
            <p className="mb-4 text-slate-600">
              「{className}」を削除します。
              {hasDependencies && (
                <span className="mt-2 block text-amber-600">
                  注意: 学生{studentCount}名、授業{lessonCount}件も一緒に削除されます。
                </span>
              )}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "削除中..." : "削除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
