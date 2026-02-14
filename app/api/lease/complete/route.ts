// app/api/lease/complete/route.ts

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

    // Get user
    const user = await prisma.user.findUnique({
      where: { walletAddress: session.user.walletAddress },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get lease
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
    });

    if (!lease) {
      return NextResponse.json({ error: "Lease not found" }, { status: 404 });
    }

    // Must be landlord or tenant of this lease
    if (lease.landlordId !== user.id && lease.tenantId !== user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
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

    // Verify contract status is COMPLETED (2)
    const leaseContract  = getLeaseContract(lease.contractAddress!);
    const contractStatus = await leaseContract.methods
      .status()
      .call() as string;

    if (contractStatus.toString() !== "2") {
      return NextResponse.json(
        { error: "Contract is not completed yet" },
        { status: 400 }
      );
    }

    // Update MongoDB
    const [updatedLease] = await prisma.$transaction([
      prisma.lease.update({
        where: { id: leaseId },
        data:  { status: "COMPLETED" },
      }),
      // Mark property as AVAILABLE again
      prisma.property.update({
        where: { id: lease.propertyId },
        data:  { status: "AVAILABLE" },
      }),
      // Cancel any remaining pending payments
      prisma.payment.updateMany({
        where:  { leaseId, status: "PENDING" },
        data:   { status: "MISSED" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      lease:   updatedLease,
      transactionHash,
    });

  } catch (error) {
    console.error("POST /api/lease/complete error:", error);
    return NextResponse.json(
      { error: "Failed to complete lease", details: String(error) },
      { status: 500 }
    );
  }
}