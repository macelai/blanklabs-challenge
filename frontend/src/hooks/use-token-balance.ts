"use client"

import { useReadContract } from "wagmi"
import { formatUnits } from "viem"
import { BLTM_ADDRESS, USDC_ADDRESS } from "@/config/addresses"
import BLTM_ABI from "@/abis/BLTM.json"

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
  const { data: balance, isLoading } = useReadContract({
    address: TOKEN_ADDRESSES[tokenType],
    abi: BLTM_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const formattedBalance = balance !== undefined
    ? Number(formatUnits(balance as bigint, TOKEN_DECIMALS[tokenType]))
    : null

  return {
    balance: formattedBalance,
    isLoading,
    rawBalance: balance
  }
}

export function useBLTMBalance(address?: string) {
  return useTokenBalance("BLTM", address)
}

export function useUSDCBalance(address?: string) {
  return useTokenBalance("USDC", address)
}