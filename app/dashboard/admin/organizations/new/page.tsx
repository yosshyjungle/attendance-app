import { CreateOrganizationForm } from "@/components/CreateOrganizationForm";

export default function NewOrganizationPage() {
  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-800">
        組織（学校）新規作成
      </h1>
      <CreateOrganizationForm />
    </div>
  );
}
