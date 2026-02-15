// contracts-hardhat/contracts/LeaseFactory.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./LeaseAgreement.sol";

/**
 * @title LeaseFactory
 * @notice Deployed once. Creates individual LeaseAgreement contracts.
 *         Your Next.js backend calls this when a landlord accepts a lease.
 */
contract LeaseFactory {

    // ─────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────

    address public owner;         // Platform deployer wallet

    // Track all leases created
    address[] public allLeases;

    // landlord address → their lease contracts
    mapping(address => address[]) public landlordLeases;

    // tenant address → their lease contracts
    mapping(address => address[]) public tenantLeases;

    // ─────────────────────────────────────────
    // EVENTS
    // ─────────────────────────────────────────

    event LeaseCreated(
        address indexed leaseContract,
        address indexed landlord,
        address indexed tenant,
        uint256 monthlyRent,
        uint256 securityDeposit,
        uint256 startDate,
        uint256 endDate
    );

    // ─────────────────────────────────────────
    // CONSTRUCTOR
    // ─────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ─────────────────────────────────────────
    // CORE FUNCTION
    // ─────────────────────────────────────────

    /**
     * @notice Deploys a new LeaseAgreement contract.
     *         Called by your Next.js backend when landlord accepts a lease.
     * @return leaseAddress The address of the newly deployed LeaseAgreement
     */
    function createLease(
        address _landlord,
        address _tenant,
        uint256 _monthlyRent,       // in wei
        uint256 _securityDeposit,   // in wei
        uint256 _startDate,         // unix timestamp
        uint256 _endDate,           // unix timestamp
        uint256 _gracePeriodDays,
        uint256 _lateFeePercentage
    ) external returns (address leaseAddress) {

        // Deploy new LeaseAgreement
        LeaseAgreement lease = new LeaseAgreement(
            _landlord,
            _tenant,
            _monthlyRent,
            _securityDeposit,
            _startDate,
            _endDate,
            _gracePeriodDays,
            _lateFeePercentage
        );

        leaseAddress = address(lease);

        // Record it
        allLeases.push(leaseAddress);
        landlordLeases[_landlord].push(leaseAddress);
        tenantLeases[_tenant].push(leaseAddress);

        emit LeaseCreated(
            leaseAddress,
            _landlord,
            _tenant,
            _monthlyRent,
            _securityDeposit,
            _startDate,
            _endDate
        );

        return leaseAddress;
    }

    // ─────────────────────────────────────────
    // VIEW FUNCTIONS
    // ─────────────────────────────────────────

    function getAllLeases() external view returns (address[] memory) {
        return allLeases;
    }

    function getLandlordLeases(address _landlord)
        external
        view
        returns (address[] memory)
    {
        return landlordLeases[_landlord];
    }

    function getTenantLeases(address _tenant)
        external
        view
        returns (address[] memory)
    {
        return tenantLeases[_tenant];
    }

    function getTotalLeasesCount() external view returns (uint256) {
        return allLeases.length;
    }
}