import { prisma } from "@/lib/prisma";
import { CreateLessonForm } from "@/components/CreateLessonForm";

export default async function NewLessonPage() {
  const classes = await prisma.class.findMany({
    include: { organization: true },
  });

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-800">
        授業新規作成
      </h1>
      <CreateLessonForm classes={classes} />
    </div>
  );
}
