"use client"

import * as React from "react"
import { ArrowDownUp, ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useDynamicContext } from "@dynamic-labs/sdk-react-core"
import LiquidityPoolABI from "@/abis/LiquidityPool.json"
import BLTMABI from "@/abis/BLTM.json"
import { useExchangeRate } from "@/hooks/use-exchange-rate"
import { useTokenApproval } from "@/hooks/use-token-approval"

interface Token {
  symbol: string
  name: string
  icon: string
  address: string
  abi: any,
}

const tokens: { [key: string]: Token } = {
  BLTM: {
    symbol: "BLTM",
    name: "Blank Labs Token",
    icon: "🔷",
    address: process.env.NEXT_PUBLIC_BLTM_ADDRESS as string,
    abi: BLTMABI,
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    icon: "💵",
    address: process.env.NEXT_PUBLIC_USDC_ADDRESS as string,
    abi: LiquidityPoolABI,
  },
}

export function SwapCard() {
  const { primaryWallet } = useDynamicContext();
  const [fromToken, setFromToken] = React.useState<Token>(tokens.BLTM)
  const [toToken, setToToken] = React.useState<Token>(tokens.USDC)
  const [fromAmount, setFromAmount] = React.useState("")
  const [toAmount, setToAmount] = React.useState("")

  const { exchangeRate, isLoading } = useExchangeRate()
  const { isApproved, handleApprove, isApproving, isApproveSuccess } = useTokenApproval(fromAmount)

  const handleSwitch = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  // Calculate the display rate based on token order
  const displayRate = fromToken.symbol === "USDC"
    ? exchangeRate
    : exchangeRate ? (1 / exchangeRate) : null

  const getButtonText = () => {
    if (!primaryWallet) return "Connect Wallet to Swap"
    if (isApproving) return "Approving..."
    if (!isApproved) return "Approve BLTM"
    return "Swap"
  }

  const handleButtonClick = async () => {
    if (!primaryWallet) return
    if (!isApproved) {
      await handleApprove()
    } else {
      // TODO: Implement swap logic
      console.log("Swap tokens")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-2xl font-semibold">Swap</CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">You pay</span>
            <Button variant="ghost" size="sm" className="gap-2">
              {fromToken.icon} {fromToken.symbol}
            </Button>
          </div>
          <Input
            type="number"
            placeholder="0.0"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            className="border-0 bg-transparent text-2xl focus-visible:ring-0"
          />
        </div>

        <div className="flex justify-center -my-2 relative z-10">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-md"
            onClick={handleSwitch}
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">You receive</span>
            <Button variant="ghost" size="sm" className="gap-2">
              {toToken.icon} {toToken.symbol}
            </Button>
          </div>
          <Input
            type="number"
            placeholder="0.0"
            value={toAmount}
            onChange={(e) => setToAmount(e.target.value)}
            className="border-0 bg-transparent text-2xl focus-visible:ring-0"
          />
        </div>

        <div className="rounded-lg border bg-card px-4 py-2 text-sm space-y-1">
          <div className="flex justify-between text-muted-foreground">
            <span>Rate</span>
            <span>1 {fromToken.symbol} = {displayRate?.toString() ?? '-'} {toToken.symbol}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Royalty Fee</span>
            <span>2.00%</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          disabled={isApproving}
          onClick={handleButtonClick}
        >
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  )
}
