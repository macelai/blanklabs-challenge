"use client";

import { Button } from "@/components/ui/button";
import { DynamicConnectButton, useDynamicContext } from "@dynamic-labs/sdk-react-core";

export function NavBar() {
  const { primaryWallet } = useDynamicContext();
  const address = primaryWallet?.address;

  return (
    <header className="border-b bg-background">
      <div className="container flex h-14 items-center justify-between">
        <div className="font-semibold pl-4">TokenSwap</div>
        <DynamicConnectButton>
          <Button size="lg">
            {address ?
              `${address.slice(0,6)}...${address.slice(-4)}` :
              'Connect Wallet'
            }
          </Button>
        </DynamicConnectButton>
      </div>
    </header>
  );
}
