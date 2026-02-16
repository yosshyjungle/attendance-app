import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EditClassForm } from "@/components/EditClassForm";

export default async function EditClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cls = await prisma.class.findUnique({
    where: { id },
    include: { organization: true },
  });

  if (!cls) notFound();

  const organizations = await prisma.organization.findMany();

  return (
    <div>
      <Link
        href="/dashboard/admin"
        className="mb-4 inline-block text-sm text-slate-500 hover:text-slate-700"
      >
        ← ダッシュボードに戻る
      </Link>
      <h1 className="mb-8 text-2xl font-bold text-slate-800">クラス編集</h1>
      <EditClassForm
        classId={cls.id}
        initialName={cls.name}
        initialOrganizationId={cls.organizationId}
        organizations={organizations}
      />
    </div>
  );
}
