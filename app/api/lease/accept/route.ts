// app/api/lease/accept/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getFactoryContract,
  getDeployerAccount,
  getServerWeb3,
  ethToWei,
} from "@/utils/blockchain/web3Server";

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

    // ── Step 1: Get landlord from DB ──
    const landlord = await prisma.user.findUnique({
      where: { walletAddress: session.user.walletAddress },
    });

    if (!landlord) {
      return NextResponse.json(
        { error: "Landlord not found" },
        { status: 404 }
      );
    }

    // ── Step 2: Get lease + validate ──
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        tenant: true,    // ✅ full tenant object (need walletAddress)
        property: true,
        landlord: true,  // ✅ add this too
      },
    });

    if (!lease) {
      return NextResponse.json(
        { error: "Lease not found" },
        { status: 404 }
      );
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

    // ── Step 3: Deploy LeaseAgreement via Factory ──
    console.log("Deploying lease contract for leaseId:", leaseId);

    const factory = getFactoryContract();
    const deployer = getDeployerAccount();
    const web3 = getServerWeb3();

    // Convert ETH amounts to Wei for the contract
    const monthlyRentWei = ethToWei(lease.monthlyRent);
    const securityDepWei = ethToWei(lease.securityDeposit);

    // Convert JS dates to Unix timestamps (seconds)
    const startTimestamp = Math.floor(
      new Date(lease.startDate).getTime() / 1000
    );
    const endTimestamp = Math.floor(
      new Date(lease.endDate).getTime() / 1000
    );

    // Estimate gas first
    const gasEstimate = await factory.methods
      .createLease(
        lease.landlord.walletAddress,   // landlord wallet address
        lease.tenant.walletAddress,     // tenant wallet address
        monthlyRentWei,
        securityDepWei,
        startTimestamp,
        endTimestamp,
        lease.gracePeriodDays,
        Math.round(lease.lateFeePercentage)
      )
      .estimateGas({ from: deployer.address });

    console.log("Estimated gas:", gasEstimate.toString());

    // Send the transaction
    const tx = await factory.methods
      .createLease(
        lease.landlord.walletAddress,
        lease.tenant.walletAddress,
        monthlyRentWei,
        securityDepWei,
        startTimestamp,
        endTimestamp,
        lease.gracePeriodDays,
        Math.round(lease.lateFeePercentage)
      )
      .send({
        from: deployer.address,
        gas: Math.round(Number(gasEstimate) * 1.2).toString(), // 20% buffer
      });

    console.log("Transaction hash:", tx.transactionHash);

    // ── Step 4: Extract deployed contract address from event ──
    const leaseCreatedEvent = tx.events?.LeaseCreated;

    if (!leaseCreatedEvent) {
      throw new Error("LeaseCreated event not found in transaction");
    }

    const contractAddress = leaseCreatedEvent.returnValues
      .leaseContract as string;

    console.log("New lease contract deployed at:", contractAddress);

    // ── Step 5: Update MongoDB atomically ──
    const [updatedLease] = await prisma.$transaction([

      // Update this lease: PENDING → AWAITING_DEPOSIT + save contract address
      prisma.lease.update({
        where: { id: leaseId },
        data: {
          status: "AWAITING_DEPOSIT",
          contractAddress,
          deployedAt: new Date(),
        },
        include: {
          tenant: {
            select: { walletAddress: true, displayName: true },
          },
          property: {
            select: { title: true, location: true },
          },
        },
      }),

      // Mark property as RENTED
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

    return NextResponse.json({
      lease: updatedLease,
      contractAddress,
      transactionHash: tx.transactionHash,
    });

  } catch (error) {
    console.error("POST /api/lease/accept error:", error);
    return NextResponse.json(
      { error: "Failed to accept lease", details: String(error) },
      { status: 500 }
    );
  }
}