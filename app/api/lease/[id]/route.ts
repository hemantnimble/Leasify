// app/api/lease/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const isValidObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Guard against route conflicts like /api/lease/tenant hitting this handler
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid lease ID" }, { status: 400 });
    }

    const session = await auth();

    if (!session?.user?.walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: session.user.walletAddress },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const lease = await prisma.lease.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            images: true,
          },
        },
        landlord: {
          select: {
            walletAddress: true,
            displayName: true,
          },
        },
        tenant: {
          select: {
            walletAddress: true,
            displayName: true,
          },
        },
        payments: {
          orderBy: { dueDate: "asc" },
        },
      },
    });

    if (!lease) {
      return NextResponse.json(
        { error: "Lease not found" },
        { status: 404 }
      );
    }

    // Only landlord or tenant of this lease can view it
    if (
      lease.landlord.walletAddress.toLowerCase() !==
        session.user.walletAddress.toLowerCase() &&
      lease.tenant.walletAddress.toLowerCase() !==
        session.user.walletAddress.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({ lease });

  } catch (error) {
    console.error("GET /api/lease/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}