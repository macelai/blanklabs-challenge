import { Button } from "@/components/ui/button"
import { WalletIcon } from 'lucide-react'

export function NavBar() {
  return (
    <header className="border-b bg-background">
      <div className="container flex h-14 items-center justify-between">
        <div className="font-semibold pl-4">TokenSwap</div>
        <Button variant="outline" size="sm" className="gap-2">
          <WalletIcon className="h-4 w-4" />
          Connect Wallet
        </Button>
      </div>
    </header>
  )
}
