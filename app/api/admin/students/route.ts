import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, studentNo, classId, userId: clerkUserId } = await request.json();
    if (!name || !classId) {
      return NextResponse.json(
        { error: "name and classId are required" },
        { status: 400 }
      );
    }

    if (clerkUserId) {
      const existing = await prisma.student.findUnique({
        where: { userId: clerkUserId },
      });
      if (existing) {
        return NextResponse.json(
          { error: "This Clerk user is already registered" },
          { status: 400 }
        );
      }
    }

    const student = await prisma.student.create({
      data: {
        name,
        studentNo: studentNo || null,
        classId,
        userId: clerkUserId || `pending-${crypto.randomUUID()}`,
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("Create student error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
