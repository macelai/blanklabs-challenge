"use client"

import * as React from "react"
import { ArrowDownUp, ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useDynamicContext } from "@dynamic-labs/sdk-react-core"

interface Token {
  symbol: string
  name: string
  icon: string
}

const tokens: { [key: string]: Token } = {
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    icon: "🔷",
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    icon: "💵",
  },
}

export function SwapCard() {
  const { primaryWallet } = useDynamicContext();
  const [fromToken, setFromToken] = React.useState<Token>(tokens.ETH)
  const [toToken, setToToken] = React.useState<Token>(tokens.USDC)
  const [fromAmount, setFromAmount] = React.useState("")
  const [toAmount, setToAmount] = React.useState("")

  const handleSwitch = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
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
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
          <Input
            type="number"
            placeholder="0.0"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            className="border-0 bg-transparent text-2xl focus-visible:ring-0"
          />
          <div className="text-sm text-muted-foreground">
            ≈ ${fromAmount ? Number.parseFloat(fromAmount) * 1800 : "0.00"}
          </div>
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
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
          <Input
            type="number"
            placeholder="0.0"
            value={toAmount}
            onChange={(e) => setToAmount(e.target.value)}
            className="border-0 bg-transparent text-2xl focus-visible:ring-0"
          />
          <div className="text-sm text-muted-foreground">
            ≈ ${toAmount ? Number.parseFloat(toAmount) * 1 : "0.00"}
          </div>
        </div>

        <div className="rounded-lg border bg-card px-4 py-2 text-sm space-y-1">
          <div className="flex justify-between text-muted-foreground">
            <span>Rate</span>
            <span>1 ETH = 1,800 USDC</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Network Fee</span>
            <span>≈ $5.00</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="lg">
          {primaryWallet ? "Swap" : "Connect Wallet to Swap"}
        </Button>
      </CardFooter>
    </Card>
  )
}
