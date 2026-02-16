import { AttendanceStatus } from "@prisma/client";

/**
 * 出席判定ルール（要件定義書 5章）
 * - 出席: 授業開始時刻までにQR入室
 * - 遅刻: 開始後15分以内にQR入室
 * - 欠席: 開始15分経過後も未入室
 * - 早退: 終了15分前より前に退室
 */
export function calculateAttendanceStatus(
  checkIn: Date | null,
  checkOut: Date | null,
  lessonStart: Date,
  lessonEnd: Date
): AttendanceStatus {
  const LATE_THRESHOLD_MINUTES = 15;
  const EARLY_LEAVE_THRESHOLD_MINUTES = 15;

  if (!checkIn) return AttendanceStatus.ABSENT;

  const lateThreshold = new Date(lessonStart);
  lateThreshold.setMinutes(lateThreshold.getMinutes() + LATE_THRESHOLD_MINUTES);

  const earlyLeaveThreshold = new Date(lessonEnd);
  earlyLeaveThreshold.setMinutes(
    earlyLeaveThreshold.getMinutes() - EARLY_LEAVE_THRESHOLD_MINUTES
  );

  // 遅刻判定
  if (checkIn > lessonStart && checkIn <= lateThreshold) {
    return AttendanceStatus.LATE;
  }

  // 欠席判定（15分経過後）
  if (checkIn > lateThreshold) {
    return AttendanceStatus.ABSENT;
  }

  // 早退判定
  if (checkOut && checkOut < earlyLeaveThreshold) {
    return AttendanceStatus.EARLY_LEAVE;
  }

  return AttendanceStatus.PRESENT;
}
