// app/api/demo/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encode } from "next-auth/jwt";

const DEMO_ACCOUNTS = {
  LANDLORD: {
    walletAddress: "0xDEMO000000000000000000000000000000LANDLORD",
    displayName: "Demo Landlord",
    role: "LANDLORD" as const,
  },
  TENANT: {
    walletAddress: "0xDEMO000000000000000000000000000000XTENANT",
    displayName: "Demo Tenant",
    role: "TENANT" as const,
  },
};

const COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

export async function POST(req: NextRequest) {
  try {
    if (process.env.DEMO_MODE !== "true") {
      return NextResponse.json({ error: "Demo mode is not enabled" }, { status: 403 });
    }

    // Resolve secret — try both next-auth v4 and v5 env var names
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error("[demo] No AUTH_SECRET or NEXTAUTH_SECRET found in environment");
      return NextResponse.json(
        { error: "Server misconfiguration: AUTH_SECRET is not set in .env.local" },
        { status: 500 }
      );
    }

    const { role } = await req.json();
    if (role !== "LANDLORD" && role !== "TENANT") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const demoAccount = DEMO_ACCOUNTS[role as "LANDLORD" | "TENANT"];

    let user = await prisma.user.findUnique({
      where: { walletAddress: demoAccount.walletAddress },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: demoAccount.walletAddress,
          role: demoAccount.role,
          displayName: demoAccount.displayName,
        },
      });
      await seedDemoData(user.id, role);
    }

    const token = await encode({
      token: {
        walletAddress: user.walletAddress,
        role: user.role,
        userId: user.id,
        name: user.displayName,
        isDemo: true,
      },
      secret,           // guaranteed string here
      salt: COOKIE_NAME, // required by next-auth v5
      maxAge: 60 * 60 * 2,
    });

    const response = NextResponse.json({
      success: true,
      role,
      redirectTo: role === "LANDLORD" ? "/dashboard/landlord" : "/dashboard/tenant",
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 2,
    });

    return response;
  } catch (error) {
    console.error("Demo login error:", error);
    return NextResponse.json(
      { error: "Failed to create demo session", details: String(error) },
      { status: 500 }
    );
  }
}

// ── Seed helpers ────────────────────────────────────────────────

async function seedDemoData(userId: string, role: string) {
  if (role === "LANDLORD") {
    const properties = [
      {
        title: "Modern 2BHK in Bandra West",
        description: "Beautifully furnished apartment with sea-facing balcony, 24/7 security and covered parking.",
        location: "Bandra West, Mumbai",
        monthlyRent: 0.008,
        securityDeposit: 0.016,
        minimumLeaseDuration: 6,
        images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"],
        status: "AVAILABLE" as const,
        landlordId: userId,
      },
      {
        title: "Skyline Studio in Powai",
        description: "Compact modern studio with stunning lake views. High-speed WiFi included.",
        location: "Powai, Mumbai",
        monthlyRent: 0.004,
        securityDeposit: 0.008,
        minimumLeaseDuration: 3,
        images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"],
        status: "RENTED" as const,
        landlordId: userId,
      },
      {
        title: "Luxury Villa in Lonavala",
        description: "4BHK villa with private pool, garden and mountain views.",
        location: "Lonavala, Pune",
        monthlyRent: 0.02,
        securityDeposit: 0.04,
        minimumLeaseDuration: 12,
        images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"],
        status: "AVAILABLE" as const,
        landlordId: userId,
      },
    ];
    for (const p of properties) {
      await prisma.property.create({ data: p });
    }
  }

  if (role === "TENANT") {
    const landlordWallet = "0xDEMO000000000000000000000000000000LANDLORD";
    let landlord = await prisma.user.findUnique({ where: { walletAddress: landlordWallet } });
    if (!landlord) {
      landlord = await prisma.user.create({
        data: { walletAddress: landlordWallet, role: "LANDLORD", displayName: "Demo Landlord" },
      });
    }

    const property = await prisma.property.create({
      data: {
        title: "Cosy 1BHK in Andheri East",
        description: "Well-maintained 1BHK close to metro station.",
        location: "Andheri East, Mumbai",
        monthlyRent: 0.005,
        securityDeposit: 0.01,
        minimumLeaseDuration: 6,
        images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"],
        status: "RENTED",
        landlordId: landlord.id,
      },
    });

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 2);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 12);

    const lease = await prisma.lease.create({
      data: {
        propertyId: property.id,
        landlordId: landlord.id,
        tenantId: userId,
        monthlyRent: 0.005,
        securityDeposit: 0.01,
        startDate,
        endDate,
        gracePeriodDays: 5,
        lateFeePercentage: 5,
        status: "ACTIVE",
        contractAddress: "0xDEMOCONTRACT0000000000000000000000000000",
        deployedAt: startDate,
      },
    });

    const p1Due = new Date(startDate);
    p1Due.setMonth(p1Due.getMonth() + 1);
    await prisma.payment.create({
      data: {
        leaseId: lease.id,
        amount: 0.005,
        dueDate: p1Due,
        paidAt: new Date(p1Due.getTime() - 86400000 * 2),
        status: "PAID",
        transactionHash: "0xdemo_tx_hash_payment_1_paid_on_time",
      },
    });

    const p2Due = new Date(startDate);
    p2Due.setMonth(p2Due.getMonth() + 2);
    await prisma.payment.create({
      data: { leaseId: lease.id, amount: 0.005, dueDate: p2Due, status: "PENDING" },
    });
  }
}