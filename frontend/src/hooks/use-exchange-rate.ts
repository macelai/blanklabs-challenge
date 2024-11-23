"use client"

import { useReadContract } from "wagmi"
import LiquidityPoolABI from "@/abis/LiquidityPool.json"
import { LIQUIDITY_POOL_ADDRESS } from "@/config/addresses"

/**
 * Hook to fetch the current exchange rate from the Liquidity Pool
 * @returns {Object} Object containing the exchange rate and loading state
 */
export function useExchangeRate() {
  const { data: exchangeRateData, isLoading } = useReadContract({
    address: LIQUIDITY_POOL_ADDRESS,
    abi: LiquidityPoolABI,
    functionName: "exchangeRate",
  });

  // Convert BigInt to number
  const exchangeRate = exchangeRateData ? Number(exchangeRateData) : null;

  return {
    exchangeRate,
    isLoading,
  }
}