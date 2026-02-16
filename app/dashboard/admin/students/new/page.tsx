import { prisma } from "@/lib/prisma";
import { CreateStudentForm } from "@/components/CreateStudentForm";

export default async function NewStudentPage() {
  const classes = await prisma.class.findMany({
    include: { organization: true },
  });

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-800">
        学生新規登録
      </h1>
      <CreateStudentForm classes={classes} />
    </div>
  );
}
