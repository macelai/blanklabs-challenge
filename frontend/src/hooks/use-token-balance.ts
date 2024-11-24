"use client"

import BLTM_ABI from "@/abis/BLTM.json"
import { BLTM_ADDRESS, USDC_ADDRESS } from "@/config/addresses"
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core"
import { formatUnits } from "viem"
import { useReadContract } from "wagmi"

export type TokenType = "BLTM" | "USDC"

const TOKEN_DECIMALS: Record<TokenType, number> = {
  BLTM: 6,
  USDC: 6,
}

const TOKEN_ADDRESSES: Record<TokenType, `0x${string}`> = {
  BLTM: BLTM_ADDRESS,
  USDC: USDC_ADDRESS,
}

/**
 * Hook to fetch ERC20 token balance for a given address
 * @param tokenType - The type of token to check ("BLTM" or "USDC")
 * @param address - The address to check the balance for
 * @returns Object containing the token balance and loading state
 */
export function useTokenBalance(tokenType: TokenType, address?: string) {
  const isLoggedIn = useIsLoggedIn();

  const { data: balance, isLoading, refetch } = useReadContract({
    address: TOKEN_ADDRESSES[tokenType],
    abi: BLTM_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isLoggedIn,
    },
  });

  const formattedBalance = balance !== undefined
    ? Number(formatUnits(balance as bigint, TOKEN_DECIMALS[tokenType]))
    : null

  return {
    balance: formattedBalance,
    isLoading,
    refetch,
  }
}

export function useBLTMBalance(address?: string) {
  return useTokenBalance("BLTM", address)
}

export function useUSDCBalance(address?: string) {
  return useTokenBalance("USDC", address)
}