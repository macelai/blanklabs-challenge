"use client";

import BLTM_ABI from "@/abis/BLTM.json";
import {
  BLTM_ADDRESS,
  LIQUIDITY_POOL_ADDRESS,
  USDC_ADDRESS,
} from "@/config/addresses";
import { useEffect, useState } from "react";
import { parseUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useToast } from "./use-toast";

export type TokenType = "BLTM" | "USDC";

const TOKEN_DECIMALS: Record<TokenType, number> = {
  BLTM: 6,
  USDC: 6,
};

const TOKEN_ADDRESSES: Record<TokenType, `0x${string}`> = {
  BLTM: BLTM_ADDRESS,
  USDC: USDC_ADDRESS,
};

/**
 * Hook to handle token approvals for the Liquidity Pool
 * @param tokenType - The type of token to approve ("BLTM" or "USDC")
 * @param amount - The amount to approve
 * @returns Object containing approval status and functions
 */
export function useTokenApproval(tokenType: TokenType, amount: string) {
  const { address: userAddress } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Convert amount to wei
  const amountInWei = amount
    ? parseUnits(amount, TOKEN_DECIMALS[tokenType])
    : 0;

  // Check current allowance
  const {
    data: allowance,
    refetch: refetchAllowance,
    isLoading: isAllowanceLoading,
  } = useReadContract({
    address: TOKEN_ADDRESSES[tokenType],
    abi: BLTM_ABI,
    functionName: "allowance",
    args: [userAddress ?? "0x", LIQUIDITY_POOL_ADDRESS],
  });

  // Simulate approve transaction
  const { data: simulateData } = useSimulateContract({
    address: TOKEN_ADDRESSES[tokenType],
    abi: BLTM_ABI,
    functionName: "approve",
    args: [LIQUIDITY_POOL_ADDRESS, amountInWei],
  });

  // Setup approve transaction
  const {
    writeContract: approve,
    data: approveData,
    status: approveStatus,
  } = useWriteContract();

  useEffect(() => {
    if (approveStatus === "success") {
      setIsLoading(false);
      toast({
        title: "Approval Initiated",
        description: "Your token approval transaction has been submitted",
      });
    } else if (approveStatus === "error") {
      setIsLoading(false);
      toast({
        title: "Approval Failed",
        description: "Failed to approve tokens. Please try again.",
        variant: "destructive",
      });
    }
  }, [approveStatus, toast]);

  // Watch for transaction receipt
  const { isLoading: isApproving, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({
      hash: approveData,
    });

  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
    toast({
        title: "Approval Successful",
        variant: "success",
        description: "Your token approval has been confirmed",
      });
    }
  }, [isApproveSuccess, refetchAllowance, toast]);

  const allowanceNumber = allowance ? Number(allowance) : 0;

  // Check if the current allowance is sufficient
  const isApproved = allowanceNumber >= amountInWei;

  // Handle approve function
  const handleApprove = async () => {
    if (!amount || !userAddress || !simulateData?.request) return;

    try {
      setIsLoading(true);
      approve(simulateData.request);
    } catch (error) {
      console.error("Error approving tokens:", error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to initiate approval transaction",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    isApproved,
    isApproving: isApproving || isLoading || isAllowanceLoading,
    isApproveSuccess,
    handleApprove,
    refetchAllowance,
  };
}

export function useBLTMApproval(amount: string) {
  return useTokenApproval("BLTM", amount);
}

export function useUSDCApproval(amount: string) {
  return useTokenApproval("USDC", amount);
}
