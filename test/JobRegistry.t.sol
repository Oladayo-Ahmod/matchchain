// SPDX-LIcense-Identifier: UNLICENSED
pragma solidity ^0.8.24;
import {Test, console} from "forge-std/Test.sol";
import {JobRegistry} from "../src/JobRegistry.sol";

contract JobRegistryTest is Test {
    JobRegistry jobRegistry;

    function setUp() public {
        jobRegistry = new JobRegistry();
    }

    function testCreateJob() public {
        string memory title = "Test Job";
        string memory description = "This is a test job";
        uint256 budget = 1 ether;
        uint256 deadline = block.timestamp + 7 days;

        uint256 jobId = jobRegistry.createJob(title, description, budget, deadline);

        (
            uint256 id,
            address employer,
            string memory returnedTitle,
            string memory returnedDescription,
            uint256 returnedBudget,
            uint256 returnedDeadline,,
            bool isActive,
        ) = jobRegistry.jobs(jobId);

        assertEq(id, jobId);
        assertEq(employer, address(this));
        assertEq(returnedTitle, title);
        assertEq(returnedDescription, description);
        assertEq(returnedBudget, budget);
        assertEq(returnedDeadline, deadline);
        assertEq(isActive, true);
    }

    function testAssignFreelancer() public {
        string memory title = "Test Job";
        string memory description = "This is a test job";
        uint256 budget = 1 ether;
        uint256 deadline = block.timestamp + 7 days;
        address freelancer = address(1);

        uint256 jobId = jobRegistry.createJob(title, description, budget, deadline);
        jobRegistry.assignFreelancer(jobId, freelancer);

        (,,,,,, address assignedFreelancer,,) = jobRegistry.jobs(jobId);

        assertEq(assignedFreelancer, freelancer);
    }
}

