import { useState, useMemo } from 'react';
import type { Token } from '@/types/token';
import { tokens } from '@/types/token';
import { useSwapCalculator } from './use-swap-calculator';

export function useSwapState() {
  const [fromToken, setFromToken] = useState<Token>(tokens.USDC);
  const [toToken, setToToken] = useState<Token>(tokens.BLTM);
  const [fromAmount, setFromAmount] = useState<string>("");

  const {
    calculateBltmOutput,
    calculateUsdcOutput,
    exchangeRate,
    isLoading: isCalculating,
  } = useSwapCalculator();

  const displayRate = useMemo(() =>
    fromToken.symbol === "USDC"
      ? exchangeRate
      : exchangeRate
      ? 1 / exchangeRate
      : null,
    [fromToken.symbol, exchangeRate]
  );

  const calculatedToAmount = useMemo(() => {
    if (!fromAmount || !exchangeRate || Number.isNaN(fromAmount)) {
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

  const handleSwitch = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(calculatedToAmount);
  };

  return {
    fromToken,
    toToken,
    fromAmount,
    setFromAmount,
    displayRate,
    calculatedToAmount,
    handleSwitch,
    isCalculating,
  };
}