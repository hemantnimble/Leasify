// app/api/user/profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { displayName } = await req.json();

    if (!displayName || displayName.trim().length === 0) {
      return NextResponse.json(
        { error: "Display name cannot be empty" },
        { status: 400 }
      );
    }

    if (displayName.trim().length > 30) {
      return NextResponse.json(
        { error: "Display name cannot exceed 30 characters" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { walletAddress: session.user.walletAddress },
      data:  { displayName: displayName.trim() },
    });

    return NextResponse.json({ success: true, displayName: updated.displayName });

  } catch (error) {
    console.error("PATCH /api/user/profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: session.user.walletAddress },
      select: {
        walletAddress: true,
        displayName:   true,
        role:          true,
        createdAt:     true,
      },
    });

    return NextResponse.json({ user });

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}