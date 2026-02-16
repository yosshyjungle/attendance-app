import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, organizationId } = await request.json();
    if (!name || !organizationId) {
      return NextResponse.json(
        { error: "name and organizationId are required" },
        { status: 400 }
      );
    }

    const cls = await prisma.class.create({
      data: { name, organizationId },
    });

    return NextResponse.json(cls);
  } catch (error) {
    console.error("Create class error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
