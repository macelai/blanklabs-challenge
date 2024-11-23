// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {BLTM} from "../src/BLTM.sol";
import {LiquidityPool} from "../src/LiquidityPool.sol";

contract DeployScript is Script {
    address constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e; // Base Sepolia USDC address

    function setUp() public {}

function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        address deployer = vm.addr(deployerPrivateKey);

        // Deploy BLMT token
        BLTM blmt = new BLTM(
            deployer,
            deployer,
            deployer
        );

        // Deploy Liquidity Pool
        LiquidityPool pool = new LiquidityPool(
            USDC,
            address(blmt),
            2
        );

        // Set BLMT minter
        blmt.grantRole(blmt.MINTER_ROLE(), address(pool));

        vm.stopBroadcast();

        console.log("BLMT deployed to:", address(blmt));
        console.log("LiquidityPool deployed to:", address(pool));
    }
}
