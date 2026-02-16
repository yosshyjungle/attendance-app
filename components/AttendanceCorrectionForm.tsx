"use client";

import { useState } from "react";
import type { AttendanceStatus } from "@/lib/attendance-types";

const statusOptions: { value: AttendanceStatus; label: string }[] = [
  { value: "PRESENT", label: "出席" },
  { value: "LATE", label: "遅刻" },
  { value: "ABSENT", label: "欠席" },
  { value: "EARLY_LEAVE", label: "早退" },
  { value: "OFFICIAL_ABSENCE", label: "公欠" },
];

function toTimeString(d: Date | null): string {
  if (!d) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AttendanceCorrectionForm({
  attendanceId,
  currentStatus,
  currentCheckIn,
  currentCheckOut,
  lessonDate,
  lessonId,
  studentId,
}: {
  attendanceId: string;
  currentStatus: AttendanceStatus;
  currentCheckIn: Date | null;
  currentCheckOut: Date | null;
  lessonDate: Date;
  lessonId: string;
  studentId: string;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [checkIn, setCheckIn] = useState(toTimeString(currentCheckIn));
  const [checkOut, setCheckOut] = useState(toTimeString(currentCheckOut));
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const dateStr = lessonDate.toISOString().slice(0, 10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const checkInDate = checkIn ? `${dateStr}T${checkIn}:00` : null;
      const checkOutDate = checkOut ? `${dateStr}T${checkOut}:00` : null;
      const res = await fetch("/api/attendance/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(attendanceId && { attendanceId }),
          lessonId,
          studentId,
          status,
          checkIn: checkInDate,
          checkOut: checkOutDate,
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
          <div className="mb-2 grid grid-cols-2 gap-2">
            <div>
              <label className="mb-0.5 block text-xs text-slate-500">
                入室
              </label>
              <input
                type="time"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="mb-0.5 block text-xs text-slate-500">
                退室
              </label>
              <input
                type="time"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="mb-0.5 block text-xs text-slate-500">
              ステータス
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
              className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
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
