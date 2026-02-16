import { AttendanceStatus } from "@prisma/client";

const statusConfig: Record<
  AttendanceStatus,
  { label: string; className: string }
> = {
  PRESENT: { label: "出席", className: "bg-green-100 text-green-800" },
  LATE: { label: "遅刻", className: "bg-amber-100 text-amber-800" },
  ABSENT: { label: "欠席", className: "bg-red-100 text-red-800" },
  EARLY_LEAVE: { label: "早退", className: "bg-orange-100 text-orange-800" },
};

export function AttendanceStatusLabel({
  status,
}: {
  status: AttendanceStatus;
}) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-800",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
