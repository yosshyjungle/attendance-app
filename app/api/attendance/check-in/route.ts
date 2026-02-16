import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateAttendanceStatus } from "@/lib/attendance";
import { AttendanceStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonToken } = await request.json();
    if (!lessonToken) {
      return NextResponse.json(
        { error: "lessonToken is required" },
        { status: 400 }
      );
    }

    const lesson = await prisma.lesson.findUnique({
      where: { qrCodeToken: lessonToken },
      include: { class: true },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Invalid lesson token" }, { status: 404 });
    }

    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student || student.classId !== lesson.classId) {
      return NextResponse.json(
        { error: "Student not in this class" },
        { status: 403 }
      );
    }

    const now = new Date();
    const status = calculateAttendanceStatus(
      now,
      null,
      lesson.startTime,
      lesson.endTime
    );

    const attendance = await prisma.attendance.upsert({
      where: {
        lessonId_studentId: {
          lessonId: lesson.id,
          studentId: student.id,
        },
      },
      create: {
        lessonId: lesson.id,
        studentId: student.id,
        checkIn: now,
        status,
      },
      update: {
        checkIn: now,
        status,
      },
    });

    return NextResponse.json({
      success: true,
      status,
      message:
        status === AttendanceStatus.PRESENT
          ? "出席として記録しました"
          : status === AttendanceStatus.LATE
            ? "遅刻として記録しました"
            : "記録しました",
    });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
