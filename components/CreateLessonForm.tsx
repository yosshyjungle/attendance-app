"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Class } from "@prisma/client";

export function CreateLessonForm({
  classes,
}: {
  classes: (Class & { organization: { name: string } })[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [period, setPeriod] = useState(1);
  const [lessonType, setLessonType] = useState<"REGULAR" | "EXAM" | "EVENT">("REGULAR");
  const [startTime, setStartTime] = useState("09:30");
  const [endTime, setEndTime] = useState("10:15");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${startDate}T${endTime}`);
      const res = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          classId,
          date: startDate,
          period,
          lessonType,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
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
          授業名
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          placeholder="国語"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          日付
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            時限
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(parseInt(e.target.value, 10))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          >
            {[1, 2, 3, 4].map((p) => (
              <option key={p} value={p}>
                {p}限
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            種別
          </label>
          <select
            value={lessonType}
            onChange={(e) =>
              setLessonType(e.target.value as "REGULAR" | "EXAM" | "EVENT")
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          >
            <option value="REGULAR">通常授業</option>
            <option value="EXAM">期末試験</option>
            <option value="EVENT">イベント</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            開始時刻
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            終了時刻
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            required
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "作成中..." : "作成"}
      </button>
    </form>
  );
}
