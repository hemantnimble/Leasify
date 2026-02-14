// app/api/lease/request/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TENANT") {
      return NextResponse.json(
        { error: "Only tenants can request leases" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { propertyId, startDate, durationMonths } = body;

    if (!propertyId || !startDate || !durationMonths) {
      return NextResponse.json(
        { error: "propertyId, startDate and durationMonths are required" },
        { status: 400 }
      );
    }

    // Get tenant from DB
    const tenant = await prisma.user.findUnique({
      where: { walletAddress: session.user.walletAddress },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Get property + validate it exists and is available
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (property.status !== "AVAILABLE") {
      return NextResponse.json(
        { error: "Property is not available for lease" },
        { status: 400 }
      );
    }

    // Validate duration meets minimum
    if (durationMonths < property.minimumLeaseDuration) {
      return NextResponse.json(
        {
          error: `Minimum lease duration is ${property.minimumLeaseDuration} months`,
        },
        { status: 400 }
      );
    }

    // Prevent tenant from requesting their own property
    if (property.landlordId === tenant.id) {
      return NextResponse.json(
        { error: "You cannot lease your own property" },
        { status: 400 }
      );
    }

    // Check tenant doesn't already have a pending/active lease on this property
    const existingLease = await prisma.lease.findFirst({
      where: {
        propertyId,
        tenantId: tenant.id,
        status: { in: ["PENDING", "AWAITING_DEPOSIT", "ACTIVE"] },
      },
    });

    if (existingLease) {
      return NextResponse.json(
        { error: "You already have an active or pending lease for this property" },
        { status: 400 }
      );
    }

    // Calculate end date
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + parseInt(durationMonths));

    // Create lease — copy terms from property at this moment
    const lease = await prisma.lease.create({
      data: {
        propertyId,
        landlordId: property.landlordId,
        tenantId: tenant.id,
        monthlyRent: property.monthlyRent,
        securityDeposit: property.securityDeposit,
        startDate: start,
        endDate: end,
        gracePeriodDays: 5,
        lateFeePercentage: 5,
        status: "PENDING",
      },
    });

    return NextResponse.json({ lease }, { status: 201 });

  } catch (error) {
    console.error("POST /api/lease/request error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}