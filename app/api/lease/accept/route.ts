// app/api/lease/accept/route.ts

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
        { error: "Only landlords can accept leases" },
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

    // Get landlord from DB
    const landlord = await prisma.user.findUnique({
      where: { walletAddress: session.user.walletAddress },
    });

    if (!landlord) {
      return NextResponse.json(
        { error: "Landlord not found" },
        { status: 404 }
      );
    }

    // Get lease and verify ownership
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { property: true },
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

    // Accept: move to AWAITING_DEPOSIT
    // Mark property as RENTED so no one else can request it
    const [updatedLease] = await prisma.$transaction([
      prisma.lease.update({
        where: { id: leaseId },
        data: { status: "AWAITING_DEPOSIT" },
        include: {
          tenant: {
            select: { walletAddress: true, displayName: true },
          },
          property: {
            select: { title: true, location: true },
          },
        },
      }),
      prisma.property.update({
        where: { id: lease.propertyId },
        data: { status: "RENTED" },
      }),
      // Reject all other PENDING leases for this property
      prisma.lease.updateMany({
        where: {
          propertyId: lease.propertyId,
          status: "PENDING",
          id: { not: leaseId },
        },
        data: { status: "REJECTED" },
      }),
    ]);

    return NextResponse.json({ lease: updatedLease });

  } catch (error) {
    console.error("POST /api/lease/accept error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}