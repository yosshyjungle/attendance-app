"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type StatusInput = "1" | "2" | "3" | "4" | "";

const STATUS_MAP: Record<StatusInput, string> = {
  "1": "PRESENT",
  "2": "LATE",
  "3": "OFFICIAL_ABSENCE",
  "4": "EARLY_LEAVE",
  "": "ABSENT",
};

const REVERSE_STATUS: Record<string, StatusInput> = {
  PRESENT: "1",
  LATE: "2",
  OFFICIAL_ABSENCE: "3",
  EARLY_LEAVE: "4",
  ABSENT: "",
};

export function AttendanceSheet({
  date,
  classes,
  selectedClassId,
  students,
  lessons,
  attendances,
}: {
  date: string;
  classes: { id: string; name: string; organization: { name: string } }[];
  selectedClassId: string;
  students: { id: string; name: string; studentNo: string | null }[];
  lessons: { id: string; period: number; name: string }[];
  attendances: Record<string, { status: string; notes: string | null }>;
}) {
  const router = useRouter();
  const [localData, setLocalData] = useState<Record<string, StatusInput>>(() => {
    const data: Record<string, StatusInput> = {};
    for (const s of students) {
      for (const l of lessons) {
        const key = `${l.id}-${s.id}`;
        const att = attendances[key];
        data[key] = (att ? REVERSE_STATUS[att.status] : "") as StatusInput;
      }
    }
    return data;
  });
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    const data: Record<string, string> = {};
    for (const s of students) {
      const firstLesson = lessons[0];
      if (firstLesson) {
        const key = `${firstLesson.id}-${s.id}`;
        const att = attendances[key];
        if (att?.notes) data[s.id] = att.notes;
      }
    }
    return data;
  });
  const [loading, setLoading] = useState(false);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    router.push(
      `/dashboard/teacher/attendance?date=${e.target.value}&classId=${selectedClassId}`
    );
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(
      `/dashboard/teacher/attendance?date=${date}&classId=${e.target.value}`
    );
  };

  const handleStatusChange = (lessonId: string, studentId: string, value: StatusInput) => {
    setLocalData((prev) => ({
      ...prev,
      [`${lessonId}-${studentId}`]: value,
    }));
  };

  const handleNotesChange = (_lessonId: string, studentId: string, value: string) => {
    setNotes((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = Object.entries(localData).map(([key, value]) => {
        const [lessonId, studentId] = key.split("-");
        const firstLesson = lessons[0];
        const isFirstPeriod = firstLesson && key.startsWith(`${firstLesson.id}-`);
        return {
          lessonId,
          studentId,
          status: STATUS_MAP[value],
          notes: isFirstPeriod ? (notes[studentId] || null) : null,
        };
      });
      const res = await fetch("/api/attendance/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, classId: selectedClassId, data }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const periods = lessons.length > 0 ? lessons : [1, 2, 3, 4].map((p) => ({ id: `p${p}`, period: p, name: `${p}限` }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            日付
          </label>
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            className="rounded-lg border border-slate-200 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            クラス
          </label>
          <select
            value={selectedClassId}
            onChange={handleClassChange}
            className="rounded-lg border border-slate-200 px-3 py-2"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {students.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-slate-500">
          学生が登録されていません
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="sticky left-0 z-10 min-w-[80px] bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-600">
                    学生番号
                  </th>
                  <th className="sticky left-[80px] z-10 min-w-[120px] bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-600">
                    氏名
                  </th>
                  {periods.map((p) => (
                    <th
                      key={typeof p === "object" ? p.id : p}
                      className="min-w-[60px] px-3 py-2 text-center text-sm font-medium text-slate-600"
                    >
                      {typeof p === "object" ? `${p.period}限` : p}
                    </th>
                  ))}
                  <th className="min-w-[120px] px-3 py-2 text-left text-sm font-medium text-slate-600">
                    特記
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100">
                    <td className="sticky left-0 z-10 bg-white px-3 py-2 font-mono text-sm">
                      {s.studentNo ?? "-"}
                    </td>
                    <td className="sticky left-[80px] z-10 bg-white px-3 py-2">
                      {s.name}
                    </td>
                    {periods.map((p) => {
                      const lessonId = typeof p === "object" ? p.id : null;
                      const key = lessonId ? `${lessonId}-${s.id}` : `p${p}-${s.id}`;
                      const value = localData[key] ?? "";
                      return (
                        <td key={key} className="px-1 py-1">
                          <select
                            value={value}
                            onChange={(e) =>
                              handleStatusChange(
                                lessonId ?? "",
                                s.id,
                                e.target.value as StatusInput
                              )
                            }
                            className="h-8 w-14 rounded border border-slate-200 bg-white text-center text-sm focus:border-indigo-500 focus:outline-none"
                          >
                            <option value="">-</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                          </select>
                        </td>
                      );
                    })}
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        placeholder="特記"
                        value={notes[s.id] ?? ""}
                        onChange={(e) => handleNotesChange("", s.id, e.target.value)}
                        className="h-8 w-full rounded border border-slate-200 px-2 text-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={loading || lessons.length === 0}
              className="rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "保存中..." : "保存"}
            </button>
            {lessons.length === 0 && (
              <p className="text-sm text-amber-600">
                この日の授業が未登録です。先に授業を作成してください。
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
