// contracts-hardhat/contracts/LeaseAgreement.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LeaseAgreement
 * @notice One instance deployed per lease. Holds deposit,
 *         tracks payments, enforces penalties, releases funds.
 */
contract LeaseAgreement {
    // ─────────────────────────────────────────
    // STATE VARIABLES
    // ─────────────────────────────────────────

    address public landlord;
    address public tenant;

    uint256 public monthlyRent; // in wei
    uint256 public securityDeposit; // in wei
    uint256 public startDate; // unix timestamp
    uint256 public endDate; // unix timestamp
    uint256 public gracePeriodDays; // e.g. 5
    uint256 public lateFeePercentage; // e.g. 5 means 5%

    // Lease lifecycle
    enum LeaseStatus {
        AWAITING_DEPOSIT, // deployed, waiting for tenant deposit
        ACTIVE, // deposit paid, lease running
        COMPLETED, // ended normally
        TERMINATED // early termination by both parties
    }

    LeaseStatus public status;

    // Payment tracking
    uint256 public totalRentPaid;
    uint256 public lastPaymentDate;
    uint256 public accumulatedPenalties;

    // Early termination — both must agree
    bool public landlordAgreesToTerminate;
    bool public tenantAgreesToTerminate;

    // ─────────────────────────────────────────
    // EVENTS
    // ─────────────────────────────────────────

    event DepositPaid(address tenant, uint256 amount, uint256 timestamp);
    event RentPaid(
        address tenant,
        uint256 amount,
        uint256 penalty,
        uint256 timestamp
    );
    event LeaseCompleted(
        uint256 depositRefunded,
        uint256 penaltiesKept,
        uint256 timestamp
    );
    event EarlyTerminationRequested(address by, uint256 timestamp);
    event LeaseTerminated(
        uint256 depositRefunded,
        uint256 penaltiesKept,
        uint256 timestamp
    );
    event PenaltyAccumulated(uint256 amount, uint256 timestamp);

    // ─────────────────────────────────────────
    // MODIFIERS
    // ─────────────────────────────────────────

    modifier onlyLandlord() {
        require(msg.sender == landlord, "Only landlord can call this");
        _;
    }

    modifier onlyTenant() {
        require(msg.sender == tenant, "Only tenant can call this");
        _;
    }

    modifier onlyParties() {
        require(
            msg.sender == landlord || msg.sender == tenant,
            "Only lease parties can call this"
        );
        _;
    }

    modifier inStatus(LeaseStatus _status) {
        require(status == _status, "Invalid lease status for this action");
        _;
    }

    // ─────────────────────────────────────────
    // CONSTRUCTOR
    // ─────────────────────────────────────────

    constructor(
        address _landlord,
        address _tenant,
        uint256 _monthlyRent,
        uint256 _securityDeposit,
        uint256 _startDate,
        uint256 _endDate,
        uint256 _gracePeriodDays,
        uint256 _lateFeePercentage
    ) {
        require(_landlord != address(0), "Invalid landlord address");
        require(_tenant != address(0), "Invalid tenant address");
        require(_landlord != _tenant, "Landlord and tenant cannot be same");
        require(_monthlyRent > 0, "Monthly rent must be greater than 0");
        require(
            _securityDeposit > 0,
            "Security deposit must be greater than 0"
        );
        require(_endDate > _startDate, "End date must be after start date");
        require(_lateFeePercentage <= 50, "Late fee cannot exceed 50%");

        landlord = _landlord;
        tenant = _tenant;
        monthlyRent = _monthlyRent;
        securityDeposit = _securityDeposit;
        startDate = _startDate;
        endDate = _endDate;
        gracePeriodDays = _gracePeriodDays;
        lateFeePercentage = _lateFeePercentage;
        status = LeaseStatus.AWAITING_DEPOSIT;
    }

    // ─────────────────────────────────────────
    // CORE FUNCTIONS
    // ─────────────────────────────────────────

    /**
     * @notice Tenant pays the security deposit to activate the lease.
     *         Must send exact deposit amount.
     */
    function payDeposit()
        external
        payable
        onlyTenant
        inStatus(LeaseStatus.AWAITING_DEPOSIT)
    {
        require(
            msg.value == securityDeposit,
            "Must send exact security deposit amount"
        );

        status = LeaseStatus.ACTIVE;
        lastPaymentDate = block.timestamp;

        emit DepositPaid(msg.sender, msg.value, block.timestamp);
    }

    /**
     * @notice Tenant pays monthly rent.
     *         If late, a penalty is calculated and added to accumulated penalties.
     *         Penalty is deducted from deposit at lease end.
     */
    function payRent()
        external
        payable
        onlyTenant
        inStatus(LeaseStatus.ACTIVE)
    {
        require(
            msg.value == monthlyRent,
            "Must send exact monthly rent amount"
        );
        require(block.timestamp <= endDate, "Lease has already ended");

        uint256 penalty = 0;

        // Check if payment is late
        if (_isLate()) {
            penalty = (monthlyRent * lateFeePercentage) / 100;
            accumulatedPenalties += penalty;
            emit PenaltyAccumulated(penalty, block.timestamp);
        }

        totalRentPaid += msg.value;
        lastPaymentDate = block.timestamp;

        // Forward rent to landlord immediately
        (bool success, ) = payable(landlord).call{value: msg.value}("");
        require(success, "Rent transfer to landlord failed");

        emit RentPaid(msg.sender, msg.value, penalty, block.timestamp);
    }

    /**
     * @notice Called after lease endDate to release deposit back to tenant.
     *         Penalties are sent to landlord, remainder to tenant.
     *         Can be called by either party.
     */
    function completeLease() external onlyParties inStatus(LeaseStatus.ACTIVE) {
        require(block.timestamp >= endDate, "Lease duration has not ended yet");

        status = LeaseStatus.COMPLETED;

        _releaseDeposit();
    }

    /**
     * @notice Either party can signal they want to terminate early.
     *         Lease terminates only when BOTH have called this.
     */
    function agreeToEarlyTermination()
        external
        onlyParties
        inStatus(LeaseStatus.ACTIVE)
    {
        if (msg.sender == landlord) {
            landlordAgreesToTerminate = true;
        } else {
            tenantAgreesToTerminate = true;
        }

        emit EarlyTerminationRequested(msg.sender, block.timestamp);

        // If both agree, terminate
        if (landlordAgreesToTerminate && tenantAgreesToTerminate) {
            status = LeaseStatus.TERMINATED;
            _releaseDeposit();
        }
    }

    // ─────────────────────────────────────────
    // VIEW FUNCTIONS
    // ─────────────────────────────────────────

    /**
     * @notice Returns all key lease details in one call.
     */
    function getLeaseDetails()
        external
        view
        returns (
            address _landlord,
            address _tenant,
            uint256 _monthlyRent,
            uint256 _securityDeposit,
            uint256 _startDate,
            uint256 _endDate,
            uint256 _gracePeriodDays,
            uint256 _lateFeePercentage,
            uint8 _status,
            uint256 _accumulatedPenalties,
            uint256 _totalRentPaid
        )
    {
        return (
            landlord,
            tenant,
            monthlyRent,
            securityDeposit,
            startDate,
            endDate,
            gracePeriodDays,
            lateFeePercentage,
            uint8(status),
            accumulatedPenalties,
            totalRentPaid
        );
    }

    /**
     * @notice Returns the current penalty if rent is paid right now.
     */
    function getCurrentPenalty() external view returns (uint256) {
        if (!_isLate()) return 0;
        return (monthlyRent * lateFeePercentage) / 100;
    }

    /**
     * @notice Returns whether rent is currently overdue.
     */
    function isRentOverdue() external view returns (bool) {
        return _isLate();
    }

    /**
     * @notice Returns contract's current ETH balance (the deposit held).
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice How many days until lease ends. 0 if already ended.
     */
    function daysRemaining() external view returns (uint256) {
        if (block.timestamp >= endDate) return 0;
        return (endDate - block.timestamp) / 1 days;
    }

    // ─────────────────────────────────────────
    // INTERNAL HELPERS
    // ─────────────────────────────────────────

    /**
     * @dev Rent is late if more than (gracePeriodDays) have passed
     *      since lastPaymentDate + 30 days (one month).
     */
    function _isLate() internal view returns (bool) {
        if (status != LeaseStatus.ACTIVE) return false;
        if (lastPaymentDate == 0) return false;

        uint256 nextDueDate = lastPaymentDate + 30 days;
        uint256 graceCutoff = nextDueDate + (gracePeriodDays * 1 days);

        return block.timestamp > graceCutoff;
    }

    /**
     * @dev Calculates penalties vs refund and transfers ETH to both parties.
     *      Called by completeLease() and agreeToEarlyTermination().
     */
    function _releaseDeposit() internal {
        uint256 balance = address(this).balance;
        uint256 penalty = accumulatedPenalties;

        // Cap penalty at deposit amount
        if (penalty > balance) {
            penalty = balance;
        }

        uint256 refund = balance - penalty;

        // Emit before transfers (reentrancy safety)
        if (status == LeaseStatus.COMPLETED) {
            emit LeaseCompleted(refund, penalty, block.timestamp);
        } else {
            emit LeaseTerminated(refund, penalty, block.timestamp);
        }

        // Send penalties to landlord
        if (penalty > 0) {
            (bool penaltySuccess, ) = payable(landlord).call{value: penalty}(
                ""
            );
            require(penaltySuccess, "Penalty transfer to landlord failed");
        }

        // Send remainder to tenant
        if (refund > 0) {
            (bool refundSuccess, ) = payable(tenant).call{value: refund}("");
            require(refundSuccess, "Deposit refund to tenant failed");
        }
    }

    /**
     * @dev Reject direct ETH transfers (only payDeposit and payRent allowed).
     */
    receive() external payable {
        revert("Use payDeposit() or payRent() functions");
    }
}
