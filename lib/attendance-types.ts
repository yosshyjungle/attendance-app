/**
 * 出席ステータス（Prisma schema と同期）
 * Vercel ビルド時の @prisma/client インポート問題を回避
 */
export const AttendanceStatus = {
  PRESENT: "PRESENT",
  LATE: "LATE",
  ABSENT: "ABSENT",
  EARLY_LEAVE: "EARLY_LEAVE",
  OFFICIAL_ABSENCE: "OFFICIAL_ABSENCE",
} as const;

export type AttendanceStatus =
  (typeof AttendanceStatus)[keyof typeof AttendanceStatus];
