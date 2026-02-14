// app/api/landlord/leases/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const landlord = await prisma.user.findUnique({
      where: { walletAddress: session.user.walletAddress },
    });

    if (!landlord) {
      return NextResponse.json({ error: "Landlord not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status"); // optional filter

    const leases = await prisma.lease.findMany({
      where: {
        landlordId: landlord.id,
        ...(statusFilter && { status: statusFilter as any }),
      },
      include: {
        tenant: {
          select: {
            walletAddress: true,
            displayName: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            images: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ leases });

  } catch (error) {
    console.error("GET /api/landlord/leases error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}