import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

type UserRole = "STUDENT" | "TEACHER" | "ADMIN";

function parseRole(role: unknown): UserRole {
    if (role === "TEACHER" || role === "ADMIN") return role;
    return "STUDENT";
}

export async function POST(req: NextRequest) {
    try {
        const evt = await verifyWebhook(req, {
            signingSecret: process.env.CLERK_WEBHOOK_SECRET,
        });

        if (evt.type === "user.created" || evt.type === "user.updated") {
            const { id, email_addresses, first_name, last_name, public_metadata } =
                evt.data;

            const email = email_addresses?.[0]?.email_address ?? null;
            const name = [first_name, last_name].filter(Boolean).join(" ") || null;

            const role = parseRole(public_metadata?.role);

            await prisma.user.upsert({
                where: { clerkId: id },
                create: {
                    clerkId: id,
                    email,
                    name,
                    role,
                },
                update: {
                    email,
                    name,
                    role,
                },
            });
        }

        if (evt.type === "user.deleted") {
            const { id } = evt.data;
            if (id) {
                await prisma.user.deleteMany({
                    where: { clerkId: id },
                });
            }
        }

        return new Response('', { status: 200 });
    } catch (err) {
        console.error("Clerk webhook error:", err);
        return new Response("Webhook verification failed", { status: 400 });
    }
}
