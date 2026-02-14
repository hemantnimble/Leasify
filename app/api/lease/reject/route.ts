// app/api/lease/reject/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "LANDLORD") {
      return NextResponse.json(
        { error: "Only landlords can reject leases" },
        { status: 403 }
      );
    }

    const { leaseId } = await req.json();

    if (!leaseId) {
      return NextResponse.json(
        { error: "leaseId is required" },
        { status: 400 }
      );
    }

    const landlord = await prisma.user.findUnique({
      where: { walletAddress: session.user.walletAddress },
    });

    if (!landlord) {
      return NextResponse.json(
        { error: "Landlord not found" },
        { status: 404 }
      );
    }

    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
    });

    if (!lease) {
      return NextResponse.json({ error: "Lease not found" }, { status: 404 });
    }

    if (lease.landlordId !== landlord.id) {
      return NextResponse.json(
        { error: "You don't own this lease" },
        { status: 403 }
      );
    }

    if (lease.status !== "PENDING") {
      return NextResponse.json(
        { error: `Lease is already ${lease.status}` },
        { status: 400 }
      );
    }

    const updatedLease = await prisma.lease.update({
      where: { id: leaseId },
      data: { status: "REJECTED" },
    });

    return NextResponse.json({ lease: updatedLease });

  } catch (error) {
    console.error("POST /api/lease/reject error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}