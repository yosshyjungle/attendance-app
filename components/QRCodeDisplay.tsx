"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

export function QRCodeDisplay({
  title,
  url,
  token,
  action,
}: {
  title: string;
  url: string;
  token: string;
  action: "in" | "out";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !url) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 256,
      margin: 2,
    }).catch((err) => {
      setError(err?.message ?? "QR生成エラー");
    });
  }, [url]);

  if (error) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 font-semibold text-slate-800">{title}</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-slate-800">{title}</h3>
      <div className="flex flex-col items-center">
        <canvas ref={canvasRef} className="rounded-lg border border-slate-100" />
        <p className="mt-4 text-center text-sm text-slate-500">
          /scan/{token}?action={action}
        </p>
      </div>
    </div>
  );
}
