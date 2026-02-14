// app/api/lease/pay-rent/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getServerWeb3,
  getLeaseContract,
} from "@/utils/blockchain/web3Server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TENANT") {
      return NextResponse.json(
        { error: "Only tenants can pay rent" },
        { status: 403 }
      );
    }

    const {
      leaseId,
      paymentId,
      transactionHash,
      contractAddress,
      penaltyAmount,
    } = await req.json();

    if (!leaseId || !paymentId || !transactionHash || !contractAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ── Validate tenant owns this lease ──
    const tenant = await prisma.user.findUnique({
      where: { walletAddress: session.user.walletAddress },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      );
    }

    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { payments: true },
    });

    if (!lease) {
      return NextResponse.json(
        { error: "Lease not found" },
        { status: 404 }
      );
    }

    if (lease.tenantId !== tenant.id) {
      return NextResponse.json(
        { error: "This lease does not belong to you" },
        { status: 403 }
      );
    }

    if (lease.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Lease is not active" },
        { status: 400 }
      );
    }

    // ── Verify transaction on-chain ──
    const web3    = getServerWeb3();
    const receipt = await web3.eth.getTransactionReceipt(transactionHash);

    if (!receipt || !receipt.status) {
      return NextResponse.json(
        { error: "Transaction not confirmed on chain" },
        { status: 400 }
      );
    }

    // ── Get current payment record ──
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }

    if (payment.status === "PAID") {
      return NextResponse.json(
        { error: "Payment already recorded" },
        { status: 400 }
      );
    }

    // ── Determine if late ──
    const now     = new Date();
    const dueDate = new Date(payment.dueDate);
    const isLate  = now > dueDate;

    // ── Calculate next payment due date ──
    const nextDueDate = new Date(dueDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);

    // ── Check if this is the last payment ──
    const isLastPayment = nextDueDate >= new Date(lease.endDate);

    // ── Update MongoDB in one transaction ──
    const operations: any[] = [
      // Mark current payment as PAID
      prisma.payment.update({
        where: { id: paymentId },
        data: {
          status:          isLate ? "LATE" : "PAID",
          paidAt:          now,
          transactionHash,
          lateFee:         penaltyAmount || 0,
        },
      }),
    ];

    // Create next payment record if lease isn't ending
    if (!isLastPayment) {
      operations.push(
        prisma.payment.create({
          data: {
            leaseId,
            amount:  lease.monthlyRent,
            dueDate: nextDueDate,
            status:  "PENDING",
          },
        })
      );
    }

    await prisma.$transaction(operations);

    return NextResponse.json({
      success: true,
      isLate,
      penaltyAmount: penaltyAmount || 0,
      nextDueDate: isLastPayment ? null : nextDueDate,
      isLastPayment,
      transactionHash,
    });

  } catch (error) {
    console.error("POST /api/lease/pay-rent error:", error);
    return NextResponse.json(
      { error: "Failed to record payment", details: String(error) },
      { status: 500 }
    );
  }
}