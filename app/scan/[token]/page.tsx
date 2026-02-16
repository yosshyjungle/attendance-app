"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ScanPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [action, setAction] = useState<"in" | "out" | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    status?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (!token) return;
    const urlParams = new URLSearchParams(window.location.search);
    const a = urlParams.get("action");
    if (a === "in" || a === "out") {
      setAction(a);
    } else {
      setAction("in");
    }
  }, [token]);

  const handleSubmit = async () => {
    if (!action || !token) return;
    setLoading(true);
    setResult(null);

    try {
      const endpoint =
        action === "in"
          ? "/api/attendance/check-in"
          : "/api/attendance/check-out";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonToken: token }),
      });
      const data = await res.json();

      if (res.ok) {
        setResult({
          success: true,
          message: data.message,
          status: data.status,
        });
      } else {
        setResult({
          success: false,
          error: data.error || "エラーが発生しました",
        });
      }
    } catch {
      setResult({
        success: false,
        error: "通信エラーが発生しました",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <p className="text-slate-600">無効なQRコードです</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-bold text-slate-800">
          {action === "in" ? "入室" : "退室"}記録
        </h1>

        {result ? (
          <div
            className={`mb-6 rounded-lg p-4 ${
              result.success
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            <p className="font-medium">
              {result.success ? result.message : result.error}
            </p>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "処理中..." : action === "in" ? "入室する" : "退室する"}
          </button>
        )}

        <button
          onClick={() => router.back()}
          className="mt-4 w-full text-center text-sm text-slate-500 hover:text-slate-700"
        >
          戻る
        </button>
      </div>
    </div>
  );
}
