"use client";

import { useState } from "react";
import { AttendanceStatus } from "@prisma/client";

const statusOptions: { value: AttendanceStatus; label: string }[] = [
  { value: "PRESENT", label: "出席" },
  { value: "LATE", label: "遅刻" },
  { value: "ABSENT", label: "欠席" },
  { value: "EARLY_LEAVE", label: "早退" },
];

export function AttendanceCorrectionForm({
  attendanceId,
  currentStatus,
  lessonId,
  studentId,
}: {
  attendanceId: string;
  currentStatus: AttendanceStatus;
  lessonId: string;
  studentId: string;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/attendance/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(attendanceId && { attendanceId }),
          lessonId,
          studentId,
          status,
          correctionReason: reason,
        }),
      });
      if (res.ok) {
        setOpen(false);
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="text-sm text-indigo-600 hover:text-indigo-700"
      >
        修正
      </button>
      {open && (
        <form
          onSubmit={handleSubmit}
          className="mt-2 rounded border border-slate-200 bg-slate-50 p-3"
        >
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
            className="mb-2 w-full rounded border border-slate-200 px-2 py-1 text-sm"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="修正理由（任意）"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mb-2 w-full rounded border border-slate-200 px-2 py-1 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              保存
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded border border-slate-200 px-3 py-1 text-sm"
            >
              キャンセル
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
