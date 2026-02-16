import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentNo, name, email, classId } = await request.json();
    if (!name || !classId) {
      return NextResponse.json(
        { error: "氏名とクラスは必須です" },
        { status: 400 }
      );
    }

    const existingStudent = await prisma.student.findUnique({
      where: { userId },
    });
    if (existingStudent) {
      return NextResponse.json(
        { error: "既に登録済みです" },
        { status: 400 }
      );
    }

    const cls = await prisma.class.findUnique({
      where: { id: classId },
    });
    if (!cls) {
      return NextResponse.json(
        { error: "クラスが見つかりません" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.upsert({
        where: { clerkId: userId },
        create: {
          clerkId: userId,
          email: email || null,
          name,
        },
        update: {
          email: email || undefined,
          name,
        },
      });

      await tx.student.create({
        data: {
          classId,
          userId,
          name,
          studentNo: studentNo?.trim() || null,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "登録に失敗しました" },
      { status: 500 }
    );
  }
}
