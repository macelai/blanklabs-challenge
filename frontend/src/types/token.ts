export interface Token {
  symbol: string;
  name: string;
  icon: string;
}

export const tokens = {
  BLTM: {
    symbol: "BLTM",
    name: "Blank Labs Token",
    icon: "🔷",
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    icon: "💵",
  },
} as const;