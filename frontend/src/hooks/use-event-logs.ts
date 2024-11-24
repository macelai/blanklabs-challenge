"use client";

import LiquidityPoolABI from "@/abis/LiquidityPool.json";
import { LIQUIDITY_POOL_ADDRESS } from "@/config/addresses";
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useCallback, useEffect, useState } from "react";
import { formatUnits } from "viem";
import { usePublicClient } from "wagmi";
import { useToast } from "./use-toast";

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
  const isLoggedIn = useIsLoggedIn();
  const { toast } = useToast();
  const publicClient = usePublicClient();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitiallyFetched, setHasInitiallyFetched] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (hasInitiallyFetched || !isLoggedIn) return;

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
      console.error("Error fetching events:", error.message);
      setIsLoading(false);
      setIsError(true);
      toast({
        title: "Error",
        description: "Failed to fetch transaction history",
        variant: "destructive",
      });
      return [];
    }
  }, [publicClient, hasInitiallyFetched, isLoggedIn, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    transactions,
    isLoading,
    isError,
    fetchEvents,
  };
}
