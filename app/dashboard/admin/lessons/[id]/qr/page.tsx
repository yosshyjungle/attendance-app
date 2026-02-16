import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";

export default async function LessonQRPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { class: true },
  });

  if (!lesson) notFound();

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const checkInUrl = `${baseUrl}/scan/${lesson.qrCodeToken}?action=in`;
  const checkOutUrl = `${baseUrl}/scan/${lesson.qrCodeToken}?action=out`;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">
        {lesson.name} - QRコード
      </h1>
      <p className="text-slate-600">{lesson.class.name}</p>

      <div className="grid gap-8 md:grid-cols-2">
        <QRCodeDisplay
          title="入室用QR"
          url={checkInUrl}
          token={lesson.qrCodeToken}
          action="in"
        />
        <QRCodeDisplay
          title="退室用QR"
          url={checkOutUrl}
          token={lesson.qrCodeToken}
          action="out"
        />
      </div>
    </div>
  );
}
