// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {EscrowVault} from "../src/EscrowVault.sol";

contract EscrowVaultTest is Test {
    EscrowVault escrowVault;
    address freelancer = address(1);

    function setUp() public {
        escrowVault = new EscrowVault();
    }

    function test_createEscrow() public{
        uint256 jobId = 1;
        escrowVault
    }

    function test_Increment() public {
        counter.increment();
        assertEq(counter.number(), 1);
    }

    function testFuzz_SetNumber(uint256 x) public {
        counter.setNumber(x);
        assertEq(counter.number(), x);
    }
}
