"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { TokenInput } from "@/components/swap/token-input";
import { useSwapState } from "@/hooks/use-swap-state";
import { useBLTMApproval, useUSDCApproval } from "@/hooks/use-token-approval";
import { useBLTMBalance, useUSDCBalance } from "@/hooks/use-token-balance";
import { useSwapTokens } from "@/hooks/use-swap-tokens";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { ArrowDownUp, Loader2 } from "lucide-react";
import { useEffect, useMemo } from "react";

export function SwapCard() {
  const { primaryWallet } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();

  const {
    fromToken,
    toToken,
    fromAmount,
    setFromAmount,
    displayRate,
    calculatedToAmount,
    handleSwitch,
    isCalculating,
  } = useSwapState();

  const {
    balance: bltmBalance,
    isLoading: isLoadingBLTMBalance,
    refetch: refetchBLTMBalance,
  } = useBLTMBalance(primaryWallet?.address);

  const {
    balance: usdcBalance,
    isLoading: isLoadingUSDCBalance,
    refetch: refetchUSDCBalance,
  } = useUSDCBalance(primaryWallet?.address);

  const {
    isApproved: isBLTMApproved,
    handleApprove: handleBLTMApprove,
    isApproving: isBLTMApproving,
  } = useBLTMApproval(fromAmount);
  const {
    isApproved: isUSDCApproved,
    handleApprove: handleUSDCApprove,
    isApproving: isUSDCApproving,
  } = useUSDCApproval(fromAmount);

  const {
    handleSwap,
    handleRedeem,
    isSwapping,
    isSwapSuccess,
    isRedeeming,
    isRedeemSuccess,
  } = useSwapTokens(fromAmount);

  useEffect(() => {
    if (isSwapSuccess || isRedeemSuccess) {
      refetchBLTMBalance();
      refetchUSDCBalance();
    }
  }, [isSwapSuccess, isRedeemSuccess, refetchBLTMBalance, refetchUSDCBalance]);

  const hasInsufficientBalance = useMemo(() => {
    if (!fromAmount) return false;
    const amount = Number(fromAmount);
    if (fromToken.symbol === "USDC") {
      return amount > (usdcBalance ?? 0);
    }
    return amount > (bltmBalance ?? 0);
  }, [fromAmount, fromToken.symbol, usdcBalance, bltmBalance]);

  const getButtonText = () => {
    if (!isLoggedIn) {
      return "Connect Wallet";
    }
    if (!primaryWallet) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        </>
      );
    }

    if (hasInsufficientBalance) {
      return "Insufficient Balance";
    }

    const isApproving =
      fromToken.symbol === "USDC" ? isUSDCApproving : isBLTMApproving;
    const isApproved =
      fromToken.symbol === "USDC" ? isUSDCApproved : isBLTMApproved;

    if (isApproving) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Approving...
        </>
      );
    }
    if (isSwapping || isRedeeming) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          {isSwapping ? "Swapping..." : "Redeeming..."}
        </>
      );
    }
    if (!isApproved) return `Approve ${fromToken.symbol}`;
    return "Swap";
  };

  const handleButtonClick = async () => {
    if (!primaryWallet || !fromAmount || hasInsufficientBalance) return;

    const isApproved =
      fromToken.symbol === "USDC" ? isUSDCApproved : isBLTMApproved;
    const handleApprove =
      fromToken.symbol === "USDC" ? handleUSDCApprove : handleBLTMApprove;

    if (!isApproved) {
      await handleApprove();
    } else {
      const amount = Number(fromAmount);
      if (fromToken.symbol === "USDC") {
        await handleSwap(amount.toString());
      } else {
        await handleRedeem(amount.toString());
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-gray-900 to-black text-white">
      <CardHeader className="text-2xl font-bold text-center">Swap</CardHeader>
      <CardContent className="space-y-4">
        <TokenInput
          token={fromToken}
          amount={fromAmount}
          onChange={setFromAmount}
          balance={fromToken.symbol === "USDC" ? usdcBalance ?? undefined : bltmBalance ?? undefined}
          isLoadingBalance={
            fromToken.symbol === "USDC" ? isLoadingUSDCBalance : isLoadingBLTMBalance
          }
          onMaxClick={() => {
            if (fromToken.symbol === "USDC" && usdcBalance) {
              setFromAmount(usdcBalance.toString());
            } else if (fromToken.symbol === "BLTM" && bltmBalance) {
              setFromAmount(bltmBalance.toString());
            }
          }}
          hasError={hasInsufficientBalance}
          label="You pay"
        />

        <div className="flex justify-center -my-2 relative z-10">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-md bg-white text-black hover:bg-gray-100"
            onClick={handleSwitch}
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>

        <TokenInput
          token={toToken}
          amount={calculatedToAmount}
          balance={
            toToken.symbol === "USDC" ? usdcBalance ?? undefined : bltmBalance ?? undefined
          }
          isLoadingBalance={
            toToken.symbol === "USDC" ? isLoadingUSDCBalance : isLoadingBLTMBalance
          }
          readOnly
          label="You receive"
        />

        <div className="rounded-lg border border-white/20 bg-black/30 px-4 py-2 text-sm space-y-1">
          <div className="flex justify-between text-white/70">
            <span>Rate</span>
            <span>
              {isCalculating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  1 {fromToken.symbol} = {displayRate?.toString() ?? "-"}{" "}
                  {toToken.symbol}
                </>
              )}
            </span>
          </div>
          <div className="flex justify-between text-white/70">
            <span>Royalty Fee</span>
            <span>2.00%</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full flex items-center justify-center bg-white text-black hover:bg-gray-100 disabled:opacity-50"
          size="lg"
          disabled={
            hasInsufficientBalance ||
            (fromToken.symbol === "USDC" ? isUSDCApproving : isBLTMApproving) ||
            !primaryWallet ||
            isSwapping ||
            isRedeeming
          }
          onClick={handleButtonClick}
        >
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
}
