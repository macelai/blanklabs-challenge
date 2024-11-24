"use client";

import { DynamicConnectButton, useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { Loader2 } from "lucide-react";

export function NavBar() {
  const { primaryWallet } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const address = primaryWallet?.address;

  const buttonContent = !isLoggedIn ? (
    "Connect Wallet"
  ) : !primaryWallet ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : address ? (
    `${address.slice(0, 6)}...${address.slice(-4)}`
  ) : (
    "Connect Wallet"
  );

  return (
    <header className="border-b bg-background">
      <div className="flex h-14 items-center justify-between px-8">
        <div className="font-bold text-2xl bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent hover:scale-105 transition-transform cursor-pointer">
          Blank Labs
        </div>
        <DynamicConnectButton>
          <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8">
            {buttonContent}
          </div>
        </DynamicConnectButton>
      </div>
    </header>
  );
}
