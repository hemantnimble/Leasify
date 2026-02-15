// contracts-hardhat/test/LeaseAgreement.test.ts

import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { LeaseAgreement, LeaseFactory } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Leasify Smart Contracts", function () {

  // ─── Test Wallets ───
  let landlord: HardhatEthersSigner;
  let tenant: HardhatEthersSigner;
  let other: HardhatEthersSigner;

  // ─── Contract Instances ───
  let factory: LeaseFactory;
  let lease: LeaseAgreement;

  // ─── Lease Parameters ───
  const MONTHLY_RENT     = ethers.parseEther("0.05");    // 0.05 ETH
  const DEPOSIT          = ethers.parseEther("0.1");     // 0.1 ETH
  const GRACE_DAYS       = 5n;
  const LATE_FEE_PCT     = 5n;                           // 5%

  let startDate: number;
  let endDate: number;

  beforeEach(async function () {
    [landlord, tenant, other] = await ethers.getSigners();

    // Dates: lease starts now, ends in 6 months
    startDate = await time.latest();
    endDate   = startDate + (180 * 24 * 60 * 60); // 6 months in seconds

    // Deploy factory
    const Factory = await ethers.getContractFactory("LeaseFactory");
    factory = await Factory.deploy();

    // Create a lease via factory
    const tx = await factory.createLease(
      landlord.address,
      tenant.address,
      MONTHLY_RENT,
      DEPOSIT,
      startDate,
      endDate,
      GRACE_DAYS,
      LATE_FEE_PCT
    );

    const receipt = await tx.wait();

    // Get lease address from event
    const event = receipt?.logs
      .map((log) => {
        try { return factory.interface.parseLog(log); }
        catch { return null; }
      })
      .find((e) => e?.name === "LeaseCreated");

    const leaseAddress = event?.args?.leaseContract;

    const LeaseAgreement = await ethers.getContractFactory("LeaseAgreement");
    lease = LeaseAgreement.attach(leaseAddress) as LeaseAgreement;
  });

  // ─────────────────────────────────────────
  // DEPLOYMENT TESTS
  // ─────────────────────────────────────────

  describe("Deployment", function () {
    it("Should set correct landlord and tenant", async function () {
      expect(await lease.landlord()).to.equal(landlord.address);
      expect(await lease.tenant()).to.equal(tenant.address);
    });

    it("Should set correct lease terms", async function () {
      expect(await lease.monthlyRent()).to.equal(MONTHLY_RENT);
      expect(await lease.securityDeposit()).to.equal(DEPOSIT);
      expect(await lease.gracePeriodDays()).to.equal(GRACE_DAYS);
      expect(await lease.lateFeePercentage()).to.equal(LATE_FEE_PCT);
    });

    it("Should start in AWAITING_DEPOSIT status (0)", async function () {
      expect(await lease.status()).to.equal(0);
    });

    it("Factory should record the lease", async function () {
      const allLeases = await factory.getAllLeases();
      expect(allLeases.length).to.equal(1);
      expect(allLeases[0]).to.equal(await lease.getAddress());
    });
  });

  // ─────────────────────────────────────────
  // DEPOSIT TESTS
  // ─────────────────────────────────────────

  describe("Deposit Payment", function () {
    it("Should accept correct deposit from tenant", async function () {
      await lease.connect(tenant).payDeposit({ value: DEPOSIT });
      expect(await lease.status()).to.equal(1); // ACTIVE
    });

    it("Should reject deposit from non-tenant", async function () {
      await expect(
        lease.connect(other).payDeposit({ value: DEPOSIT })
      ).to.be.revertedWith("Only tenant can call this");
    });

    it("Should reject wrong deposit amount", async function () {
      await expect(
        lease.connect(tenant).payDeposit({ value: ethers.parseEther("0.05") })
      ).to.be.revertedWith("Must send exact security deposit amount");
    });

    it("Should reject double deposit", async function () {
      await lease.connect(tenant).payDeposit({ value: DEPOSIT });
      await expect(
        lease.connect(tenant).payDeposit({ value: DEPOSIT })
      ).to.be.revertedWith("Invalid lease status for this action");
    });

    it("Should hold deposit in contract", async function () {
      await lease.connect(tenant).payDeposit({ value: DEPOSIT });
      expect(await lease.getContractBalance()).to.equal(DEPOSIT);
    });
  });

  // ─────────────────────────────────────────
  // RENT PAYMENT TESTS
  // ─────────────────────────────────────────

  describe("Rent Payment", function () {
    beforeEach(async function () {
      // Activate lease first
      await lease.connect(tenant).payDeposit({ value: DEPOSIT });
    });

    it("Should accept correct rent from tenant", async function () {
      const landlordBefore = await ethers.provider.getBalance(landlord.address);
      await lease.connect(tenant).payRent({ value: MONTHLY_RENT });

      const landlordAfter = await ethers.provider.getBalance(landlord.address);
      expect(landlordAfter).to.be.gt(landlordBefore);
    });

    it("Should reject wrong rent amount", async function () {
      await expect(
        lease.connect(tenant).payRent({ value: ethers.parseEther("0.01") })
      ).to.be.revertedWith("Must send exact monthly rent amount");
    });

    it("Should reject rent from non-tenant", async function () {
      await expect(
        lease.connect(other).payRent({ value: MONTHLY_RENT })
      ).to.be.revertedWith("Only tenant can call this");
    });

    it("Should accumulate penalty for late payment", async function () {
      // Fast forward past grace period (30 days + 5 grace days + 1)
      await time.increase(36 * 24 * 60 * 60);

      await lease.connect(tenant).payRent({ value: MONTHLY_RENT });

      const penalties = await lease.accumulatedPenalties();
      const expectedPenalty = (MONTHLY_RENT * LATE_FEE_PCT) / 100n;
      expect(penalties).to.equal(expectedPenalty);
    });

    it("Should return penalty amount for late payment", async function () {
      await time.increase(36 * 24 * 60 * 60);
      const penalty = await lease.getCurrentPenalty();
      const expected = (MONTHLY_RENT * LATE_FEE_PCT) / 100n;
      expect(penalty).to.equal(expected);
    });

    it("Should report overdue status correctly", async function () {
      expect(await lease.isRentOverdue()).to.equal(false);
      await time.increase(36 * 24 * 60 * 60);
      expect(await lease.isRentOverdue()).to.equal(true);
    });
  });

  // ─────────────────────────────────────────
  // LEASE COMPLETION TESTS
  // ─────────────────────────────────────────

  describe("Lease Completion", function () {
    beforeEach(async function () {
      await lease.connect(tenant).payDeposit({ value: DEPOSIT });
    });

    it("Should refund full deposit after lease ends with no penalties", async function () {
      await time.increaseTo(endDate + 1);

      const tenantBefore = await ethers.provider.getBalance(tenant.address);
      const tx = await lease.connect(tenant).completeLease();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * tx.gasPrice!;

      const tenantAfter = await ethers.provider.getBalance(tenant.address);
      expect(tenantAfter + gasUsed).to.be.closeTo(
        tenantBefore + DEPOSIT,
        ethers.parseEther("0.001")
      );
    });

    it("Should deduct penalties from deposit on completion", async function () {
      // Miss a payment — fast forward past grace period
      await time.increase(36 * 24 * 60 * 60);
      await lease.connect(tenant).payRent({ value: MONTHLY_RENT });

      const penalties = await lease.accumulatedPenalties();
      expect(penalties).to.be.gt(0);

      await time.increaseTo(endDate + 1);
      await lease.connect(tenant).completeLease();

      expect(await lease.status()).to.equal(2); // COMPLETED
    });

    it("Should reject completeLease before endDate", async function () {
      await expect(
        lease.connect(tenant).completeLease()
      ).to.be.revertedWith("Lease duration has not ended yet");
    });
  });

  // ─────────────────────────────────────────
  // EARLY TERMINATION TESTS
  // ─────────────────────────────────────────

  describe("Early Termination", function () {
    beforeEach(async function () {
      await lease.connect(tenant).payDeposit({ value: DEPOSIT });
    });

    it("Should not terminate with only one party agreeing", async function () {
      await lease.connect(landlord).agreeToEarlyTermination();
      expect(await lease.status()).to.equal(1); // Still ACTIVE
    });

    it("Should terminate when both parties agree", async function () {
      await lease.connect(landlord).agreeToEarlyTermination();
      await lease.connect(tenant).agreeToEarlyTermination();
      expect(await lease.status()).to.equal(3); // TERMINATED
    });

    it("Should refund deposit on termination", async function () {
      const tenantBefore = await ethers.provider.getBalance(tenant.address);

      const tx1 = await lease.connect(landlord).agreeToEarlyTermination();
      const r1 = await tx1.wait();

      const tx2 = await lease.connect(tenant).agreeToEarlyTermination();
      const r2 = await tx2.wait();

      const gasUsed =
        (r1!.gasUsed * tx1.gasPrice!) +
        (r2!.gasUsed * tx2.gasPrice!);

      const tenantAfter = await ethers.provider.getBalance(tenant.address);

      expect(tenantAfter + gasUsed).to.be.closeTo(
        tenantBefore + DEPOSIT,
        ethers.parseEther("0.001")
      );
    });
  });

  // ─────────────────────────────────────────
  // SECURITY TESTS
  // ─────────────────────────────────────────

  describe("Security", function () {
    it("Should reject direct ETH transfers", async function () {
      await expect(
        other.sendTransaction({
          to: await lease.getAddress(),
          value: ethers.parseEther("1"),
        })
      ).to.be.revertedWith("Use payDeposit() or payRent() functions");
    });

    it("Should reject completeLease from non-parties", async function () {
      await lease.connect(tenant).payDeposit({ value: DEPOSIT });
      await time.increaseTo(endDate + 1);
      await expect(
        lease.connect(other).completeLease()
      ).to.be.revertedWith("Only lease parties can call this");
    });
  });

});