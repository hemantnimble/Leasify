// app/api/properties/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET — Fetch all available properties (public, no auth needed)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get("location");
    const minRent = searchParams.get("minRent");
    const maxRent = searchParams.get("maxRent");

    // Build dynamic filter
    const where: any = {
      status: "AVAILABLE",
    };

    if (location) {
      where.location = {
        contains: location,
        mode: "insensitive", // case-insensitive search
      };
    }

    if (minRent || maxRent) {
      where.monthlyRent = {};
      if (minRent) where.monthlyRent.gte = parseFloat(minRent);
      if (maxRent) where.monthlyRent.lte = parseFloat(maxRent);
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        landlord: {
          select: {
            id: true,
            walletAddress: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ properties });
  } catch (error) {
    console.error("GET /api/properties error:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}

// POST — Create a new property (landlord only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "LANDLORD") {
      return NextResponse.json(
        { error: "Only landlords can list properties" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      location,
      monthlyRent,
      securityDeposit,
      minimumLeaseDuration,
      images,
    } = body;

    // Basic validation
    if (
      !title ||
      !description ||
      !location ||
      !monthlyRent ||
      !securityDeposit ||
      !minimumLeaseDuration
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Get landlord's DB user id
    const user = await prisma.user.findUnique({
      where: { walletAddress: session.user.walletAddress },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const property = await prisma.property.create({
      data: {
        landlordId: user.id,
        title,
        description,
        location,
        monthlyRent: parseFloat(monthlyRent),
        securityDeposit: parseFloat(securityDeposit),
        minimumLeaseDuration: parseInt(minimumLeaseDuration),
        images: images || [],
        status: "AVAILABLE",
      },
    });

    return NextResponse.json({ property }, { status: 201 });
  } catch (error) {
    console.error("POST /api/properties error:", error);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}