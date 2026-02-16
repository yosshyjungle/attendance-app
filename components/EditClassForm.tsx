"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Organization } from "@prisma/client";

export function EditClassForm({
  classId,
  initialName,
  initialOrganizationId,
  organizations,
}: {
  classId: string;
  initialName: string;
  initialOrganizationId: string;
  organizations: Organization[];
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [organizationId, setOrganizationId] = useState(initialOrganizationId);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, organizationId }),
      });
      if (res.ok) router.push("/dashboard/admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          組織
        </label>
        <select
          value={organizationId}
          onChange={(e) => setOrganizationId(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          required
        >
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          クラス名
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          placeholder="1年経営ビジネス学科"
          required
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "保存中..." : "保存"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/admin")}
          className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
