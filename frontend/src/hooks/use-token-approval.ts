"use client"

import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useSimulateContract
} from "wagmi";
import BLTM_ABI from "@/abis/BLTM.json"
import { BLTM_ADDRESS, LIQUIDITY_POOL_ADDRESS } from "@/config/addresses"
import { parseUnits } from "viem"

/**
 * Hook to handle BLTM token approvals for the Liquidity Pool
 * @param amount - The amount to approve (in BLTM tokens)
 * @returns Object containing approval status and functions
 */
export function useTokenApproval(amount: string) {
  const { address: userAddress } = useAccount()

  // Convert amount to wei
  const amountInWei = amount ? parseUnits(amount, 18) : 0

  // Check current allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: BLTM_ADDRESS,
    abi: BLTM_ABI,
    functionName: "allowance",
    args: [userAddress ?? "0x", LIQUIDITY_POOL_ADDRESS],
  })

  const allowanceNumber = Number(allowance)

  // Simulate approve transaction
  const { data: simulateData } = useSimulateContract({
    address: BLTM_ADDRESS,
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