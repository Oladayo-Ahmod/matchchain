// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Test,console} from "forge-std/Test.sol";
import {EscrowVault} from "../src/EscrowVault.sol";



contract EscrowVaultTest is Test {
    EscrowVault escrowVault;
    address freelancer = address(1);

    function setUp() public {
        escrowVault = new EscrowVault();
    }

    function testCreateEscrow() public {
        uint256 jobId = 1;
        uint256 amount = 1 ether;

        vm.deal(address(this), amount);
        uint256 escrowId = escrowVault.createEscrow(jobId, freelancer);

        (uint256 id, address employer, address assignedFreelancer, uint256 returnedJobId, uint256 escrowAmount, EscrowVault.EscrowStatus status, , ) = escrowVault.escrows(escrowId);

        assertEq(id, escrowId);
        assertEq(employer, address(this));
        assertEq(assignedFreelancer, freelancer);
        assertEq(returnedJobId, jobId);
        assertEq(escrowAmount, 0);
        assertEq(uint256(status), uint256(EscrowVault.EscrowStatus.Created));
    }

    function testFundEscrow() public {
        uint256 jobId = 1;
        uint256 amount = 1 ether;

        vm.deal(address(this), amount);
        uint256 escrowId = escrowVault.createEscrow(jobId, freelancer);
        escrowVault.fundEscrow{value: amount}(escrowId);

        (uint256 id, address employer, address assignedFreelancer, uint256 returnedJobId, uint256 escrowAmount, EscrowVault.EscrowStatus status, , ) = escrowVault.escrows(escrowId);

        assertEq(escrowAmount, amount);
        assertEq(uint256(status), uint256(EscrowVault.EscrowStatus.Funded));
    }

    function test_releaseMilestone() public{
        uint256 jobId = 1;
        uint256 amount = 1 ether;

        vm.deal(address(this), amount);
        uint256 escrowId = escrowVault.createEscrow(jobId, freelancer);
        escrowVault.fundEscrow{value: amount}(escrowId);

        escrowVault.releaseMilestone(escrowId);
         (uint256 id, address employer, address assignedFreelancer, uint256 returnedJobId, uint256 escrowAmount, EscrowVault.EscrowStatus status, , ) = escrowVault.escrows(escrowId);
         assertEq(uint256(status), 2);
         assertEq(assignedFreelancer.balance,amount);
         console.log("status:", uint256(status));
         console.log(assignedFreelancer.balance);
    }

    function test_refundEscrow() public{
        uint256 jobId = 1;
        uint256 amount = 1 ether;

        vm.deal(address(this), amount);
        uint256 escrowId = escrowVault.createEscrow(jobId, freelancer);
        escrowVault.fundEscrow{value: amount}(escrowId);

        escrowVault.refundEscrow(escrowId);
         (uint256 id, address employer, address assignedFreelancer, uint256 returnedJobId, uint256 escrowAmount, EscrowVault.EscrowStatus status, , ) = escrowVault.escrows(escrowId);
         assertEq(uint256(status), 3);
         assertEq(employer.balance,amount);
         console.log("status:", uint256(status));
         console.log(employer.balance);
    }

    function test_cancelEscrow() public{
        uint256 jobId = 1;

        uint256 escrowId = escrowVault.createEscrow(jobId, freelancer);

        escrowVault.cancelEscrow(escrowId);
         (uint256 id, address employer, address assignedFreelancer, uint256 returnedJobId, uint256 escrowAmount, EscrowVault.EscrowStatus status, , ) = escrowVault.escrows(escrowId);
         assertEq(uint256(status), 4);
         console.log("status:", uint256(status));
    }


}
