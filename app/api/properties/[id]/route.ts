// app/api/properties/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ✅ Promise type
) {
  try {
    const { id } = await params;  // ✅ await it

    if (!id || id.length !== 24) {
      return NextResponse.json(
        { error: "Invalid property ID" },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        landlord: {
          select: {
            id: true,
            walletAddress: true,
            displayName: true,
          },
        },
        leases: {
          where: {
            status: {
              in: ["ACTIVE", "AWAITING_DEPOSIT"],
            },
          },
          select: { id: true, status: true },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ property });

  } catch (error) {
    console.error("GET /api/properties/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ✅ Promise type
) {
  try {
    const { id } = await params;  // ✅ await it

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

    const existing = await prisma.property.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (existing.landlordId !== user.id) {
      return NextResponse.json(
        { error: "You don't own this property" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const updated = await prisma.property.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description && { description: body.description }),
        ...(body.location && { location: body.location }),
        ...(body.monthlyRent && { monthlyRent: parseFloat(body.monthlyRent) }),
        ...(body.securityDeposit && { securityDeposit: parseFloat(body.securityDeposit) }),
        ...(body.minimumLeaseDuration && { minimumLeaseDuration: parseInt(body.minimumLeaseDuration) }),
        ...(body.status && { status: body.status }),
        ...(body.images && { images: body.images }),
      },
    });

    return NextResponse.json({ property: updated });

  } catch (error) {
    console.error("PATCH /api/properties/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}