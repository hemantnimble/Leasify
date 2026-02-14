// app/api/lease/confirm-deposit/route.ts

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

        if (session.user.role !== "TENANT") {
            return NextResponse.json(
                { error: "Only tenants can confirm deposits" },
                { status: 403 }
            );
        }

        const { leaseId, transactionHash, contractAddress } = await req.json();

        if (!leaseId || !transactionHash || !contractAddress) {
            return NextResponse.json(
                { error: "leaseId, transactionHash and contractAddress are required" },
                { status: 400 }
            );
        }

        // ── Validate lease belongs to this tenant ──
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

        if (lease.status !== "AWAITING_DEPOSIT") {
            return NextResponse.json(
                { error: `Lease is already ${lease.status}` },
                { status: 400 }
            );
        }

        // ── Verify transaction on-chain ──
        const web3 = getServerWeb3();

        // Wait for transaction receipt (confirms it was mined)
        const receipt = await web3.eth.getTransactionReceipt(transactionHash);

        if (!receipt) {
            return NextResponse.json(
                { error: "Transaction not found on chain. Please wait and try again." },
                { status: 400 }
            );
        }

        if (!receipt.status) {
            return NextResponse.json(
                { error: "Transaction failed on chain." },
                { status: 400 }
            );
        }

        // ── Verify contract status is now ACTIVE (1) ──
        const leaseContract = getLeaseContract(contractAddress);
        const contractStatus = await leaseContract.methods.status().call() as string;

        if (contractStatus.toString() !== "1") {
            return NextResponse.json(
                { error: "Contract is not active yet. Please wait for confirmation." },
                { status: 400 }
            );
        }

        // ── Update MongoDB ──
        const updatedLease = await prisma.lease.update({
            where: { id: leaseId },
            data: {
                status: "ACTIVE",
            },
        });

        // ── Create first payment record ──
        const firstPaymentDue = new Date(lease.startDate);
        firstPaymentDue.setMonth(firstPaymentDue.getMonth() + 1);

        await prisma.payment.create({
            data: {
                leaseId,
                amount: lease.monthlyRent,
                dueDate: firstPaymentDue,
                status: "PENDING",
            },
        });

        return NextResponse.json({
            success: true,
            lease: updatedLease,
            transactionHash,
        });

    } catch (error) {
        console.error("POST /api/lease/confirm-deposit error:", error);
        return NextResponse.json(
            { error: "Failed to confirm deposit", details: String(error) },
            { status: 500 }
        );
    }
}