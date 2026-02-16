import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

/**
 * オンボーディング（初回登録）が必要か判定
 * 教員・管理者はスキップ、学生でStudentレコードがない場合は必要
 */
export async function needsOnboarding(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (user?.role === "TEACHER" || user?.role === "ADMIN") {
    return false;
  }

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const role = clerkUser.publicMetadata?.role as string | undefined;
  if (role === "TEACHER" || role === "ADMIN") {
    return false;
  }

  const student = await prisma.student.findUnique({
    where: { userId },
  });

  return !student;
}
