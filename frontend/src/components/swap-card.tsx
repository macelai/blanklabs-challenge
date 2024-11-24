"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSwapCalculator } from "@/hooks/use-swap-calculator";
import { useSwapTokens } from "@/hooks/use-swap-tokens";
import { useBLTMApproval, useUSDCApproval } from "@/hooks/use-token-approval";
import { useBLTMBalance, useUSDCBalance } from "@/hooks/use-token-balance";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { ArrowDownUp, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Token {
  symbol: string;
  name: string;
  icon: string;
}

const tokens: { [key: string]: Token } = {
  BLTM: {
    symbol: "BLTM",
    name: "Blank Labs Token",
    icon: "🔷",
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    icon: "💵",
  },
};

export function SwapCard() {
  const { primaryWallet } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const [fromToken, setFromToken] = useState<Token>(tokens.USDC);
  const [toToken, setToToken] = useState<Token>(tokens.BLTM);
  const [fromAmount, setFromAmount] = useState<string>("");

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

  const {
    calculateBltmOutput,
    calculateUsdcOutput,
    exchangeRate,
    isLoading: isCalculating,
  } = useSwapCalculator();

  const handleSwitch = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(calculatedToAmount);
  };

  const displayRate =
    fromToken.symbol === "USDC"
      ? exchangeRate
      : exchangeRate
      ? 1 / exchangeRate
      : null;

  const calculatedToAmount = useMemo(() => {
    if (!fromAmount || !exchangeRate) {
      return "";
    }

    if (Number.isNaN(fromAmount)) {
      return "";
    }

    const amount = Number(fromAmount);
    return fromToken.symbol === "USDC"
      ? calculateBltmOutput(amount.toString())?.toString() ?? ""
      : calculateUsdcOutput(amount.toString())?.toString() ?? "";
  }, [
    fromAmount,
    exchangeRate,
    fromToken.symbol,
    calculateBltmOutput,
    calculateUsdcOutput,
  ]);

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
        <div className="rounded-lg border border-white/20 bg-black/30 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">You pay</span>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-white hover:bg-white/20 text-lg font-medium"
            >
              {fromToken.icon} {fromToken.symbol}
            </Button>
          </div>
          <Input
            type="number"
            placeholder="0.0"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            className={`border-0 bg-transparent text-lg md:text-xl lg:text-2xl font-bold focus-visible:ring-0 text-white placeholder-white/50 ${
              hasInsufficientBalance ? "text-red-400" : ""
            }`}
          />
          <div className="flex justify-end">
            <Button
              variant="link"
              className="text-sm text-white/70 p-0 h-auto hover:text-white/90"
              onClick={() => {
                if (fromToken.symbol === "USDC" && usdcBalance) {
                  setFromAmount(usdcBalance.toString());
                } else if (fromToken.symbol === "BLTM" && bltmBalance) {
                  setFromAmount(bltmBalance.toString());
                }
              }}
            >
              {fromToken.symbol === "USDC"
                ? isLoadingUSDCBalance
                  ? "Loading..."
                  : usdcBalance
                  ? `Balance: ${usdcBalance.toFixed(2)}`
                  : null
                : isLoadingBLTMBalance
                ? "Loading..."
                : bltmBalance
                ? `Balance: ${bltmBalance}`
                : null}
            </Button>
          </div>
        </div>

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

        <div className="rounded-lg border border-white/20 bg-black/30 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">You receive</span>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-white hover:bg-white/20 text-lg font-medium"
            >
              {toToken.icon} {toToken.symbol}
            </Button>
          </div>
          <Input
            type="number"
            placeholder="0.0"
            value={calculatedToAmount?.toString() ?? "0.0"}
            readOnly
            disabled
            className="border-0 bg-transparent text-lg md:text-xl lg:text-2xl font-bold focus-visible:ring-0 text-white placeholder-white/50"
          />
        </div>

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
