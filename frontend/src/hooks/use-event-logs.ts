"use client";

import { usePublicClient } from "wagmi";
import { LIQUIDITY_POOL_ADDRESS } from "@/config/addresses";
import { formatUnits } from "viem";
import LiquidityPoolABI from "@/abis/LiquidityPool.json";
import { useEffect, useState, useCallback } from "react";

interface Transaction {
  id: string;
  action: "mint" | "burn";
  usdcAmount: number;
  bltmAmount: number;
}

/**
 * Hook to fetch event logs directly from the blockchain
 * @returns Object containing transaction history and loading state
 */
export function useEventLogs() {
  const publicClient = usePublicClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitiallyFetched, setHasInitiallyFetched] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (hasInitiallyFetched) return;

    try {
      const [swapLogs, redeemLogs] = await Promise.all([
        publicClient.getContractEvents({
          address: LIQUIDITY_POOL_ADDRESS,
          abi: LiquidityPoolABI,
          eventName: "TokensSwapped",
          fromBlock: BigInt(18315855),
        }),
        publicClient.getContractEvents({
          address: LIQUIDITY_POOL_ADDRESS,
          abi: LiquidityPoolABI,
          eventName: "TokensRedeemed",
          fromBlock: BigInt(18315855),
        }),
      ]);

      console.log("swapLogs", swapLogs);

      const allTransactions = [
        ...swapLogs.map((log) => ({
          id: `${log.transactionHash}-${log.logIndex}`,
          action: "mint" as const,
          usdcAmount: Number(formatUnits(log.args.usdcAmount, 6)),
          bltmAmount: Number(formatUnits(log.args.bltmAmount, 6)),
        })),
        ...redeemLogs.map((log) => ({
          id: `${log.transactionHash}-${log.logIndex}`,
          action: "burn" as const,
          usdcAmount: Number(formatUnits(log.args.usdcAmount, 6)),
          bltmAmount: Number(formatUnits(log.args.bltmAmount, 6)),
        })),
      ]
      setTransactions(allTransactions);
      setHasInitiallyFetched(true);
      setIsLoading(false);
      return allTransactions;
    } catch (error) {
      console.error("Error fetching events:", error);
      setIsLoading(false);
      return [];
    }
  }, [publicClient, hasInitiallyFetched]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    transactions,
    isLoading,
    fetchEvents,
  };
}
