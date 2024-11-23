"use client"

import { useWriteContract, useWaitForTransactionReceipt, useSimulateContract } from "wagmi"
import { LIQUIDITY_POOL_ADDRESS } from "@/config/addresses"
import LiquidityPoolABI from "@/abis/LiquidityPool.json"
import { parseUnits } from "viem"

/**
 * Hook for swapping USDC to BLTM and redeeming BLTM for USDC
 * @param amount - The amount to swap/redeem as a string
 * @returns Object containing swap and redeem functions and their states
 */
export function useSwapTokens(amount?: string) {
  console.log("amount", parseUnits(amount ?? "0", 6));
  // Swap USDC for BLTM
  const { data: simulateSwapData } = useSimulateContract({
    address: LIQUIDITY_POOL_ADDRESS,
    abi: LiquidityPoolABI,
    functionName: "swapUsdcForBltm",
    args: amount ? [parseUnits(amount, 6)] : undefined,
  });

  console.log("simulateSwapData", simulateSwapData);

  const { writeContract: swap, data: swapData } = useWriteContract()

  const {
    isLoading: isSwapping,
    isSuccess: isSwapSuccess,
  } = useWaitForTransactionReceipt({
    hash: swapData,
  })

  // Redeem BLTM for USDC
  const { data: simulateRedeemData } = useSimulateContract({
    address: LIQUIDITY_POOL_ADDRESS,
    abi: LiquidityPoolABI,
    functionName: "redeemBltmForUsdc",
    args: amount ? [parseUnits(amount, 6)] : undefined,
  })

  const { writeContract: redeem, data: redeemData } = useWriteContract()

  const {
    isLoading: isRedeeming,
    isSuccess: isRedeemSuccess,
  } = useWaitForTransactionReceipt({
    hash: redeemData,
  })

  const handleSwap = async (usdcAmount: string) => {
    if (!simulateSwapData?.request) return
    console.log("simulateSwapData", simulateSwapData.request);

    try {
      const amountInWei = parseUnits(usdcAmount, 6) // USDC has 6 decimals
      swap({
        ...simulateSwapData.request,
        args: [amountInWei],
      })
    } catch (error) {
      console.error("Error swapping tokens:", error)
      throw error
    }
  }

  const handleRedeem = async (bltmAmount: string) => {
    if (!simulateRedeemData?.request) return

    try {
      const amountInWei = parseUnits(bltmAmount, 6) // BLTM has 6 decimals
      redeem({
        ...simulateRedeemData.request,
        args: [amountInWei],
      })
    } catch (error) {
      console.error("Error redeeming tokens:", error)
      throw error
    }
  }

  return {
    // Swap
    handleSwap,
    isSwapping,
    isSwapSuccess,
    // Redeem
    handleRedeem,
    isRedeeming,
    isRedeemSuccess,
  }
}