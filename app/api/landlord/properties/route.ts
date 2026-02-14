// app/api/landlord/properties/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        // ✅ Add detailed logging
        console.log("Session in API:", JSON.stringify(session, null, 2));

        if (!session?.user?.walletAddress) {
            console.log("No session found — returning 401");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { walletAddress: session.user.walletAddress },
        });

        console.log("User found:", user);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const properties = await prisma.property.findMany({
            where: { landlordId: user.id },
            include: {
                landlord: {                    // ✅ add this
                    select: {
                        id: true,
                        walletAddress: true,
                        displayName: true,
                    },
                },
                leases: {
                    select: {
                        id: true,
                        status: true,
                        tenant: {
                            select: {
                                walletAddress: true,
                                displayName: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        console.log("Properties found:", properties.length);

        return NextResponse.json({ properties });

    } catch (error) {
        // ✅ This was missing before — catch block was silent
        console.error("GET /api/landlord/properties error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: String(error) },
            { status: 500 }
        );
    }
}