// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {EscrowVault} from "../src/EscrowVault.sol";
import {JobRegistry} from "../src/JobRegistry.sol";
import {console} from "forge-std/console.sol";

/**
 * @title DeployScript
 * @notice Deployment script for EscrowVault and JobRegistry contracts
 *
 * Usage:
 *
 * 1. Dry Run (simulate deployment, no gas spent):
 *    forge script script/Deploy.s.sol --rpc-url <RPC_URL>
 *
 * 2. Broadcast to Testnet (requires private key):
 *    forge script script/Deploy.s.sol --rpc-url <RPC_URL> --private-key <PRIVATE_KEY> --broadcast
 *
 * 3. Broadcast to Mainnet (requires private key):
 *    forge script script/Deploy.s.sol --rpc-url <RPC_URL> --private-key <PRIVATE_KEY> --broadcast --verify
 *
 * 4. Dry Run on Anvil (local):
 *    forge script script/Deploy.s.sol
 *
 * 5. Broadcast on Anvil (local):
 *    forge script script/Deploy.s.sol --broadcast
 *
 * Environment Setup:
 * - Set RPC_URL: export RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY"
 * - Set PRIVATE_KEY: export PRIVATE_KEY="0x..."
 * - Check your wallet has enough ETH for gas
 */
contract DeployScript is Script {
    EscrowVault public escrowVault;
    JobRegistry public jobRegistry;

    address private deployer;

    function setUp() public {
        // The deployer address will be the one whose private key is used
        deployer = msg.sender;
    }

    function run() public {
        console.log("Deploying contracts...");
        console.log("Deployer address:", deployer);

        // Start broadcast - records all transactions
        vm.startBroadcast();

        // Deploy JobRegistry first (no dependencies)
        jobRegistry = new JobRegistry();
        console.log("JobRegistry deployed at:", address(jobRegistry));

        // Deploy EscrowVault (no dependencies on JobRegistry)
        escrowVault = new EscrowVault();
        console.log("EscrowVault deployed at:", address(escrowVault));

        // Stop broadcast
        vm.stopBroadcast();

        // Print summary
        console.log("\n=== Deployment Complete ===");
        console.log("JobRegistry:  ", address(jobRegistry));
        console.log("EscrowVault:  ", address(escrowVault));
        console.log("Deployer:     ", deployer);
    }

    /**
     * @notice Helper function to verify deployment (call after deployment)
     * Run with: forge script script/Deploy.s.sol:DeployScript --sig "verify()" --rpc-url <RPC_URL>
     */
    function verify() public view {
        require(address(jobRegistry) != address(0), "JobRegistry not deployed");
        require(address(escrowVault) != address(0), "EscrowVault not deployed");
        console.log("All contracts deployed successfully!");
    }
}
