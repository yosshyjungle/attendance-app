import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data } = await request.json();
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: "data array is required" },
        { status: 400 }
      );
    }

    for (const item of data) {
      const { lessonId, studentId, status, notes } = item;
      if (!lessonId || !studentId) continue;

      await prisma.attendance.upsert({
        where: {
          lessonId_studentId: { lessonId, studentId },
        },
        create: {
          lessonId,
          studentId,
          status: status || "ABSENT",
          notes: notes || null,
          updatedBy: userId,
        },
        update: {
          status: status || "ABSENT",
          notes: notes || null,
          updatedBy: userId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bulk attendance error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
