import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      attendanceId,
      lessonId,
      studentId,
      status,
      checkIn,
      checkOut,
      correctionReason,
    } = await request.json();
    if (!status) {
      return NextResponse.json(
        { error: "status is required" },
        { status: 400 }
      );
    }

    const updateData = {
      status,
      checkIn: checkIn ? new Date(checkIn) : null,
      checkOut: checkOut ? new Date(checkOut) : null,
      correctionReason: correctionReason || null,
      updatedBy: userId,
    };

    if (attendanceId) {
      await prisma.attendance.update({
        where: { id: attendanceId },
        data: updateData,
      });
    } else if (lessonId && studentId) {
      await prisma.attendance.upsert({
        where: {
          lessonId_studentId: { lessonId, studentId },
        },
        create: {
          lessonId,
          studentId,
          ...updateData,
        },
        update: updateData,
      });
    } else {
      return NextResponse.json(
        { error: "attendanceId or (lessonId and studentId) required" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Correction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
