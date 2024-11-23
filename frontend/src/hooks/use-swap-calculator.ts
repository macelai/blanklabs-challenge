"use client"

import { useExchangeRate } from "./use-exchange-rate"

const ROYALTY_RATE = 200 // 5% (500 basis points)
const BASIS_POINTS = 10000

/**
 * Hook to calculate expected output amounts for swaps and redemptions
 * @returns Object containing calculation functions and exchange rate
 */
export function useSwapCalculator() {
  const { exchangeRate, isLoading } = useExchangeRate()

  const calculateBltmOutput = (usdcAmount: string) => {
    if (!exchangeRate || !usdcAmount) return null

    const amount = Number(usdcAmount)
    const royaltyAmount = (amount * ROYALTY_RATE) / BASIS_POINTS
    const netAmount = amount - royaltyAmount
    return netAmount * exchangeRate
  }

  const calculateUsdcOutput = (bltmAmount: string) => {
    if (!exchangeRate || !bltmAmount) return null

    const amount = Number(bltmAmount)
    return amount / exchangeRate
  }

  return {
    calculateBltmOutput,
    calculateUsdcOutput,
    exchangeRate,
    isLoading,
  }
}