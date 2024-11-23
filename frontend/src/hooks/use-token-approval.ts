"use client"

import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useSimulateContract
} from "wagmi";
import BLTM_ABI from "@/abis/BLTM.json"
import { BLTM_ADDRESS, USDC_ADDRESS, LIQUIDITY_POOL_ADDRESS } from "@/config/addresses"
import { parseUnits } from "viem"

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
 * Hook to handle token approvals for the Liquidity Pool
 * @param tokenType - The type of token to approve ("BLTM" or "USDC")
 * @param amount - The amount to approve
 * @returns Object containing approval status and functions
 */
export function useTokenApproval(tokenType: TokenType, amount: string) {
  const { address: userAddress } = useAccount()

  // Convert amount to wei
  const amountInWei = amount ? parseUnits(amount, TOKEN_DECIMALS[tokenType]) : 0

  // Check current allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: TOKEN_ADDRESSES[tokenType],
    abi: BLTM_ABI,
    functionName: "allowance",
    args: [userAddress ?? "0x", LIQUIDITY_POOL_ADDRESS],
  })

  // Simulate approve transaction
  const { data: simulateData } = useSimulateContract({
    address: TOKEN_ADDRESSES[tokenType],
    abi: BLTM_ABI,
    functionName: "approve",
    args: [LIQUIDITY_POOL_ADDRESS, amountInWei],
  });

  // Setup approve transaction
  const { writeContract: approve, data: approveData } = useWriteContract()

  // Watch for transaction receipt
  const { isLoading: isApproving, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({
      hash: approveData,
    })

  const allowanceNumber = allowance ? Number(allowance) : 0

  // Check if the current allowance is sufficient
  const isApproved = allowance ? allowanceNumber >= Number(amountInWei) : false

  // Handle approve function
  const handleApprove = async () => {
    if (!amount || !userAddress || !simulateData?.request) return

    try {
      approve(simulateData.request)
    } catch (error) {
      console.error("Error approving tokens:", error)
      throw error
    }
  }

  return {
    isApproved,
    isApproving,
    isApproveSuccess,
    handleApprove,
    refetchAllowance,
  }
}

export function useBLTMApproval(amount: string) {
  return useTokenApproval("BLTM", amount)
}

export function useUSDCApproval(amount: string) {
  return useTokenApproval("USDC", amount)
}