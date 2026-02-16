import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateAttendanceStatus } from "@/lib/attendance";

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

    const attendance = await prisma.attendance.findUnique({
      where: {
        lessonId_studentId: {
          lessonId: lesson.id,
          studentId: student.id,
        },
      },
    });

    if (!attendance || !attendance.checkIn) {
      return NextResponse.json(
        { error: "No check-in record found" },
        { status: 400 }
      );
    }

    const now = new Date();
    const status = calculateAttendanceStatus(
      attendance.checkIn,
      now,
      lesson.startTime,
      lesson.endTime
    );

    await prisma.attendance.update({
      where: {
        lessonId_studentId: {
          lessonId: lesson.id,
          studentId: student.id,
        },
      },
      data: {
        checkOut: now,
        status,
      },
    });

    return NextResponse.json({
      success: true,
      status,
      message: "退室を記録しました",
    });
  } catch (error) {
    console.error("Check-out error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
