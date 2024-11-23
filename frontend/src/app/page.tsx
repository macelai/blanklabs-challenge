import { NavBar } from "@/components/nav-bar"
import { SwapCard } from "@/components/swap-card"

export default function Home() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="py-8">
        <SwapCard />
      </main>
    </div>
  )
}
