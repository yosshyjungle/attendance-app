import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "@/components/OnboardingForm";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const student = await prisma.student.findUnique({
    where: { userId },
  });
  if (student) redirect("/dashboard");

  const classes = await prisma.class.findMany({
    include: { organization: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-xl font-bold text-slate-800">
          初回登録
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          学生番号・氏名・メールアドレスを入力してください
        </p>
        <OnboardingForm classes={classes} />
      </div>
    </div>
  );
}
