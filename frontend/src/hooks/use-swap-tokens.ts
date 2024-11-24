"use client"

import { useWriteContract, useWaitForTransactionReceipt, useSimulateContract } from "wagmi"
import { LIQUIDITY_POOL_ADDRESS } from "@/config/addresses"
import LiquidityPoolABI from "@/abis/LiquidityPool.json"
import { parseUnits } from "viem"
import { useEffect, useState } from "react"
import { useToast } from "./use-toast"

/**
 * Hook for swapping USDC to BLTM and redeeming BLTM for USDC
 * @param amount - The amount to swap/redeem as a string
 * @returns Object containing swap and redeem functions and their states
 */
export function useSwapTokens(amount?: string) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Swap USDC for BLTM
  const { data: simulateSwapData } = useSimulateContract({
    address: LIQUIDITY_POOL_ADDRESS,
    abi: LiquidityPoolABI,
    functionName: "swapUsdcForBltm",
    args: amount ? [parseUnits(amount, 6)] : undefined,
  });

  const {
    writeContract: swap,
    data: swapData,
    status: swapStatus
  } = useWriteContract()

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

  const {
    writeContract: redeem,
    data: redeemData,
    status: redeemStatus
  } = useWriteContract()

  const {
    isLoading: isRedeeming,
    isSuccess: isRedeemSuccess,
  } = useWaitForTransactionReceipt({
    hash: redeemData,
  })

  useEffect(() => {
    if (swapStatus === "success") {
      setIsLoading(false)
      toast({
        title: "Swap Initiated",
        description: "Your swap transaction has been submitted",
      })
    } else if (swapStatus === "error") {
      setIsLoading(false)
      toast({
        title: "Swap Failed",
        description: "Failed to swap tokens. Please try again.",
        variant: "destructive",
      })
    }

    if (redeemStatus === "success") {
      setIsLoading(false)
      toast({
        title: "Redeem Initiated",
        description: "Your redeem transaction has been submitted",
      })
    } else if (redeemStatus === "error") {
      setIsLoading(false)
      toast({
        title: "Redeem Failed",
        description: "Failed to redeem tokens. Please try again.",
        variant: "destructive",
      })
    }
  }, [swapStatus, redeemStatus, toast])

  useEffect(() => {
    if (isSwapSuccess) {
      toast({
        title: "Swap Successful",
        variant: "success",
        description: "Your swap has been confirmed",
      })
    }
    if (isRedeemSuccess) {
      toast({
        title: "Redeem Successful",
        variant: "success",
        description: "Your redeem has been confirmed",
      })
    }
  }, [isSwapSuccess, isRedeemSuccess, toast])

  const handleSwap = async (usdcAmount: string) => {
    if (!simulateSwapData?.request) return

    try {
      setIsLoading(true)
      const amountInWei = parseUnits(usdcAmount, 6) // USDC has 6 decimals
      swap({
        ...simulateSwapData.request,
        args: [amountInWei],
      })
    } catch (error) {
      console.error("Error swapping tokens:", error)
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to initiate swap transaction",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleRedeem = async (bltmAmount: string) => {
    if (!simulateRedeemData?.request) return

    try {
      setIsLoading(true)
      const amountInWei = parseUnits(bltmAmount, 6) // BLTM has 6 decimals
      redeem({
        ...simulateRedeemData.request,
        args: [amountInWei],
      })
    } catch (error) {
      console.error("Error redeeming tokens:", error)
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to initiate redeem transaction",
        variant: "destructive",
      })
      throw error
    }
  }

  return {
    // Swap
    handleSwap,
    isSwapping: isSwapping || isLoading,
    isSwapSuccess,
    // Redeem
    handleRedeem,
    isRedeeming: isRedeeming || isLoading,
    isRedeemSuccess,
  }
}