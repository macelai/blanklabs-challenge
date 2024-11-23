// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Test, console} from "forge-std/Test.sol";
import {LiquidityPool} from "../src/LiquidityPool.sol";
import {BLTM} from "../src/BLTM.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";
import {ILiquidityPoolEventsAndErrors} from "../src/ILiquidityPoolEventsAndErrors.sol";

contract LiquidityPoolTest is Test {
    LiquidityPool public pool;
    BLTM public bltm;
    MockERC20 public usdc;

    address public owner;
    address public user1;
    address public user2;

    uint256 public constant INITIAL_EXCHANGE_RATE = 100;
    uint256 public constant INITIAL_USDC_SUPPLY = 1000000 * 10**6; // 1M USDC

    event ExchangeRateUpdated(uint256 newRate);
    event TokensSwapped(address indexed user, uint256 usdcAmount, uint256 bltmAmount);
    event TokensRedeemed(address indexed user, uint256 bltmAmount, uint256 usdcAmount);
    event UsdcWithdrawn(address indexed owner, uint256 amount);

    function setUp() public {
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);

        // Deploy tokens
        usdc = new MockERC20("USD Coin", "USDC", 6);
        bltm = new BLTM(owner, owner, address(0));

        // Deploy pool
        pool = new LiquidityPool(address(usdc), address(bltm), INITIAL_EXCHANGE_RATE);

        // Setup roles
        bltm.grantRole(bltm.MINTER_ROLE(), address(pool));

        // Mint initial USDC
        usdc.mint(user1, INITIAL_USDC_SUPPLY);
        usdc.mint(user2, INITIAL_USDC_SUPPLY);
    }

    function test_InitialState() public {
        assertEq(address(pool.usdcToken()), address(usdc));
        assertEq(address(pool.bltmToken()), address(bltm));
        assertEq(pool.exchangeRate(), INITIAL_EXCHANGE_RATE);
        assertTrue(pool.hasRole(pool.OWNER_ROLE(), owner));
        assertTrue(pool.hasRole(pool.DEFAULT_ADMIN_ROLE(), owner));
    }

    function test_UpdateExchangeRate() public {
        uint256 newRate = 200;

        vm.expectEmit(true, true, true, true);
        emit ExchangeRateUpdated(newRate);

        pool.updateExchangeRate(newRate);
        assertEq(pool.exchangeRate(), newRate);
    }

    function test_UpdateExchangeRate_ZeroRate() public {
        vm.expectRevert(abi.encodeWithSelector(ILiquidityPoolEventsAndErrors.InvalidExchangeRate.selector, 0));
        pool.updateExchangeRate(0);
    }

    function test_UpdateExchangeRate_OnlyOwner() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                user1,
                pool.OWNER_ROLE()
            )
        );
        vm.prank(user1);
        pool.updateExchangeRate(200);
    }

    function test_SwapUsdcForBltm() public {
        uint256 usdcAmount = 1000 * 10**6; // 1000 USDC
        uint256 expectedRoyalty = (usdcAmount * 200) / 10000; // 2% royalty
        uint256 expectedNetAmount = usdcAmount - expectedRoyalty;
        uint256 expectedBltmAmount = expectedNetAmount * INITIAL_EXCHANGE_RATE;

        vm.startPrank(user1);
        usdc.approve(address(pool), usdcAmount);

        vm.expectEmit(true, true, true, true);
        emit TokensSwapped(user1, usdcAmount, expectedBltmAmount);

        pool.swapUsdcForBltm(usdcAmount);
        vm.stopPrank();

        assertEq(bltm.balanceOf(user1), expectedBltmAmount);
        assertEq(usdc.balanceOf(address(pool)), usdcAmount);
    }

    function test_SwapUsdcForBltm_ZeroAmount() public {
        vm.expectRevert(ILiquidityPoolEventsAndErrors.ZeroAmount.selector);
        pool.swapUsdcForBltm(0);
    }

    function test_RedeemBltmForUsdc() public {
        // First swap USDC for BLTM
        uint256 usdcAmount = 1000 * 10**6;
        vm.startPrank(user1);
        usdc.approve(address(pool), usdcAmount);
        pool.swapUsdcForBltm(usdcAmount);

        uint256 bltmBalance = bltm.balanceOf(user1);
        uint256 expectedUsdcAmount = bltmBalance / INITIAL_EXCHANGE_RATE;

        vm.expectEmit(true, true, true, true);
        emit TokensRedeemed(user1, bltmBalance, expectedUsdcAmount);

        pool.redeemBltmForUsdc(bltmBalance);
        vm.stopPrank();

        assertEq(bltm.balanceOf(user1), 0);
        assertEq(usdc.balanceOf(user1), INITIAL_USDC_SUPPLY - usdcAmount + expectedUsdcAmount);
    }

    function test_RedeemBltmForUsdc_ZeroAmount() public {
        vm.expectRevert(ILiquidityPoolEventsAndErrors.ZeroAmount.selector);
        pool.redeemBltmForUsdc(0);
    }

    function test_RedeemBltmForUsdc_RedemptionTooSmall() public {
        vm.expectRevert(ILiquidityPoolEventsAndErrors.RedemptionTooSmall.selector);
        pool.redeemBltmForUsdc(1);
    }

    function test_WithdrawUsdc() public {
        uint256 usdcAmount = 1000 * 10**6;

        // First get some USDC in the pool
        vm.startPrank(user1);
        usdc.approve(address(pool), usdcAmount);
        pool.swapUsdcForBltm(usdcAmount);
        vm.stopPrank();

        vm.expectEmit(true, true, true, true);
        emit UsdcWithdrawn(owner, usdcAmount);

        pool.withdrawUsdc(usdcAmount);

        assertEq(usdc.balanceOf(owner), usdcAmount);
        assertEq(usdc.balanceOf(address(pool)), 0);
    }

    function test_WithdrawUsdc_ZeroAmount() public {
        vm.expectRevert(ILiquidityPoolEventsAndErrors.ZeroAmount.selector);
        pool.withdrawUsdc(0);
    }

    function test_WithdrawUsdc_InsufficientBalance() public {
        vm.expectRevert(ILiquidityPoolEventsAndErrors.InsufficientBalance.selector);
        pool.withdrawUsdc(1000);
    }

    function test_WithdrawUsdc_OnlyOwner() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                user1,
                pool.OWNER_ROLE()
            )
        );
        vm.prank(user1);
        pool.withdrawUsdc(1000);
    }

    function testFuzz_SwapAndRedeem(uint256 usdcAmount) public {
        // Ensure usdcAmount is within valid bounds and not too small
        vm.assume(usdcAmount >= 100 * 10**6 && usdcAmount <= INITIAL_USDC_SUPPLY);

        uint256 initialUsdcBalance = usdc.balanceOf(user1);

        vm.startPrank(user1);
        usdc.approve(address(pool), usdcAmount);
        pool.swapUsdcForBltm(usdcAmount);

        uint256 bltmBalance = bltm.balanceOf(user1);
        pool.redeemBltmForUsdc(bltmBalance);
        vm.stopPrank();

        assertEq(bltm.balanceOf(user1), 0);
        assertGt(usdc.balanceOf(user1), 0);
        assertLt(usdc.balanceOf(user1), initialUsdcBalance); // Account for royalty
    }
}
