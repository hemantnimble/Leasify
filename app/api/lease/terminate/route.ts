// app/api/lease/terminate/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getServerWeb3, getLeaseContract } from "@/utils/blockchain/web3Server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leaseId, transactionHash } = await req.json();

    if (!leaseId || !transactionHash) {
      return NextResponse.json(
        { error: "leaseId and transactionHash are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: session.user.walletAddress },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
    });

    if (!lease) {
      return NextResponse.json({ error: "Lease not found" }, { status: 404 });
    }

    if (lease.landlordId !== user.id && lease.tenantId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (lease.status !== "ACTIVE") {
      return NextResponse.json(
        { error: `Lease is already ${lease.status}` },
        { status: 400 }
      );
    }

    // Verify transaction on-chain
    const web3    = getServerWeb3();
    const receipt = await web3.eth.getTransactionReceipt(transactionHash);

    if (!receipt || !receipt.status) {
      return NextResponse.json(
        { error: "Transaction not confirmed on chain" },
        { status: 400 }
      );
    }

    // Check contract status — is it TERMINATED (3) or still ACTIVE (1)?
    const leaseContract  = getLeaseContract(lease.contractAddress!);
    const contractStatus = await leaseContract.methods
      .status()
      .call() as string;

    const bothAgreed = contractStatus.toString() === "3";

    if (bothAgreed) {
      // Both agreed — finalize in MongoDB
      await prisma.$transaction([
        prisma.lease.update({
          where: { id: leaseId },
          data:  { status: "TERMINATED" },
        }),
        prisma.property.update({
          where: { id: lease.propertyId },
          data:  { status: "AVAILABLE" },
        }),
        prisma.payment.updateMany({
          where: { leaseId, status: "PENDING" },
          data:  { status: "MISSED" },
        }),
      ]);
    }

    // If not both agreed yet — just record the agreement, lease stays ACTIVE

    return NextResponse.json({
      success:    true,
      bothAgreed,
      message: bothAgreed
        ? "Both parties agreed. Lease terminated and deposit released."
        : "Your agreement recorded. Waiting for the other party.",
      transactionHash,
    });

  } catch (error) {
    console.error("POST /api/lease/terminate error:", error);
    return NextResponse.json(
      { error: "Failed to record termination", details: String(error) },
      { status: 500 }
    );
  }
}