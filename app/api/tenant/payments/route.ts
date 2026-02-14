// app/api/tenant/payments/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenant = await prisma.user.findUnique({
      where: { walletAddress: session.user.walletAddress },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      );
    }

    const payments = await prisma.payment.findMany({
      where: {
        lease: {
          tenantId: tenant.id,
          status:   "ACTIVE",
        },
        status: { in: ["PENDING", "LATE", "MISSED"] },
      },
      include: {
        lease: {
          select: {
            id:              true,
            contractAddress: true,
            monthlyRent:     true,
            property: {
              select: { title: true, location: true },
            },
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json({ payments });

  } catch (error) {
    console.error("GET /api/tenant/payments error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
