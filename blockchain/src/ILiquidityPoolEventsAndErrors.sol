// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface ILiquidityPoolEventsAndErrors {
    // Errors
    error InvalidAddress();
    error InvalidExchangeRate(uint256 rate);
    error ZeroAmount();
    error RedemptionTooSmall();
    error InsufficientBalance();
    error TransferFailed();

    // Events
    event ExchangeRateUpdated(uint256 newRate);
    event TokensSwapped(address indexed user, uint256 usdcAmount, uint256 bltmAmount);
    event TokensRedeemed(address indexed user, uint256 bltmAmount, uint256 usdcAmount);
    event UsdcWithdrawn(address indexed owner, uint256 amount);
}
