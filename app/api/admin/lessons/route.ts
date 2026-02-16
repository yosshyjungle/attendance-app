import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, classId, startTime, endTime } = await request.json();
    if (!name || !classId || !startTime || !endTime) {
      return NextResponse.json(
        { error: "name, classId, startTime, endTime are required" },
        { status: 400 }
      );
    }

    const qrCodeToken = `lesson-${randomBytes(16).toString("hex")}`;

    const lesson = await prisma.lesson.create({
      data: {
        name,
        classId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        qrCodeToken,
      },
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Create lesson error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
