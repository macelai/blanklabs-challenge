// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import {Test, console} from "forge-std/Test.sol";
import {BLTM} from "../src/BLTM.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

contract BLTMTest is Test {
    BLTM public token;
    address public defaultAdmin;
    address public pauser;
    address public minter;
    address public user1;
    address public user2;

    function setUp() public {
        defaultAdmin = address(this);
        pauser = address(0x1);
        minter = address(0x2);
        user1 = address(0x3);
        user2 = address(0x4);

        token = new BLTM(defaultAdmin, pauser, minter);
    }

    function test_InitialState() public {
        assertEq(token.name(), "BLTM");
        assertEq(token.symbol(), "BLTM");
        assertEq(token.decimals(), 6);
        assertTrue(token.hasRole(token.DEFAULT_ADMIN_ROLE(), defaultAdmin));
        assertTrue(token.hasRole(token.MINTER_ROLE(), minter));
        assertTrue(token.hasRole(token.PAUSER_ROLE(), pauser));
    }

    function test_Mint() public {
        uint256 amount = 1000000;
        vm.prank(minter);
        token.mint(user1, amount);
        assertEq(token.balanceOf(user1), amount);
        assertEq(token.totalSupply(), amount);
    }

    function test_Burn() public {
        uint256 amount = 1000000;
        vm.prank(minter);
        token.mint(user1, amount);

        vm.prank(minter);
        token.burn(user1, amount / 2);
        assertEq(token.balanceOf(user1), amount / 2);
        assertEq(token.totalSupply(), amount / 2);
    }

    function test_Transfer() public {
        uint256 amount = 1000000;
        vm.prank(minter);
        token.mint(user1, amount);

        vm.prank(user1);
        token.transfer(user2, amount / 2);

        assertEq(token.balanceOf(user1), amount / 2);
        assertEq(token.balanceOf(user2), amount / 2);
    }

    function test_PauseUnpause() public {
        vm.prank(pauser);
        token.pause();
        assertTrue(token.paused());

        vm.prank(pauser);
        token.unpause();
        assertFalse(token.paused());

        uint256 amount = 1000000;
        vm.prank(minter);
        token.mint(user1, amount);

        vm.prank(pauser);
        token.pause();

        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                Pausable.EnforcedPause.selector
            )
        );
        token.transfer(user2, amount);

        vm.prank(pauser);
        token.unpause();
        assertFalse(token.paused());

        vm.prank(user1);
        token.transfer(user2, amount);
        assertEq(token.balanceOf(user2), amount);
    }

    function test_OnlyMinterCanMint() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                user1,
                token.MINTER_ROLE()
            )
        );
        vm.prank(user1);
        token.mint(user1, 1000000);
    }

    function test_OnlyPauserCanPause() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                user1,
                token.PAUSER_ROLE()
            )
        );
        vm.prank(user1);
        token.pause();
    }

    function testFuzz_MintBurn(uint256 amount) public {
        vm.assume(amount > 0 && amount < type(uint256).max);

        vm.prank(minter);
        token.mint(user1, amount);
        assertEq(token.balanceOf(user1), amount);

        vm.prank(minter);
        token.burn(user1, amount);
        assertEq(token.balanceOf(user1), 0);
    }
}
