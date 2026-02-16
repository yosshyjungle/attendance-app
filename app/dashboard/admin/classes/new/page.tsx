import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CreateClassForm } from "@/components/CreateClassForm";

export default async function NewClassPage() {
  const organizations = await prisma.organization.findMany();

  if (organizations.length === 0) {
    redirect("/dashboard/admin/organizations/new");
  }

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-800">クラス新規作成</h1>
      <CreateClassForm organizations={organizations} />
    </div>
  );
}
