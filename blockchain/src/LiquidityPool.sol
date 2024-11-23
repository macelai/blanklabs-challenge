// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {BLTM} from "./BLTM.sol";
import {ILiquidityPoolEventsAndErrors} from "./ILiquidityPoolEventsAndErrors.sol";

contract LiquidityPool is AccessControl, ILiquidityPoolEventsAndErrors {
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");

    IERC20 public immutable usdcToken;
    BLTM public immutable bltmToken;
    uint256 public exchangeRate;
    uint256 private constant ROYALTY_RATE = 200; // 2% = 200 basis points
    uint256 private constant BASIS_POINTS = 10000;

    constructor(
        address _usdcToken,
        address _bltmToken,
        uint256 _exchangeRate
    ) {
        if (_usdcToken == address(0)) revert InvalidAddress();
        if (_bltmToken == address(0)) revert InvalidAddress();
        if (_exchangeRate == 0) revert InvalidExchangeRate(0);

        usdcToken = IERC20(_usdcToken);
        bltmToken = BLTM(_bltmToken);
        exchangeRate = _exchangeRate;

        _grantRole(OWNER_ROLE, msg.sender);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function updateExchangeRate(uint256 newRate) external onlyRole(OWNER_ROLE) {
        if (newRate == 0) revert InvalidExchangeRate(newRate);
        exchangeRate = newRate;
        emit ExchangeRateUpdated(newRate);
    }

    function swapUsdcForBltm(uint256 usdcAmount) external {
        if (usdcAmount == 0) revert ZeroAmount();

        uint256 royaltyAmount = (usdcAmount * ROYALTY_RATE) / BASIS_POINTS;
        uint256 netAmount = usdcAmount - royaltyAmount;
        uint256 bltmAmount = netAmount * exchangeRate;

        if (!usdcToken.transferFrom(msg.sender, address(this), usdcAmount)) revert TransferFailed();
        bltmToken.mint(msg.sender, bltmAmount);

        emit TokensSwapped(msg.sender, usdcAmount, bltmAmount);
    }

    function redeemBltmForUsdc(uint256 bltmAmount) external {
        if (bltmAmount == 0) revert ZeroAmount();

        uint256 usdcAmount = bltmAmount / exchangeRate;
        if (usdcAmount == 0) revert RedemptionTooSmall();

        bltmToken.burn(msg.sender, bltmAmount);
        if (!usdcToken.transfer(msg.sender, usdcAmount)) revert TransferFailed();

        emit TokensRedeemed(msg.sender, bltmAmount, usdcAmount);
    }

    function withdrawUsdc(uint256 amount) external onlyRole(OWNER_ROLE) {
        if (amount == 0) revert ZeroAmount();
        if (usdcToken.balanceOf(address(this)) < amount) revert InsufficientBalance();

        if (!usdcToken.transfer(msg.sender, amount)) revert TransferFailed();
        emit UsdcWithdrawn(msg.sender, amount);
    }
}
