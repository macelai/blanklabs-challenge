import { NavBar } from "@/components/nav-bar"
import { SwapCard } from "@/components/swap-card"
import { TransactionHistory } from "@/components/transaction-history"

export default function Home() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="py-8">
        <div className="text-center mb-4 text-muted-foreground">
          No USDC on Base Sepolia? Get some at{" "}
          <a
            href="https://faucet.circle.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            https://faucet.circle.com/
          </a>
        </div>
        <SwapCard />
        <TransactionHistory />
      </main>
    </div>
  )
}
