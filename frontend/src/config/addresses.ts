// Contract addresses
export const LIQUIDITY_POOL_ADDRESS = process.env.NEXT_PUBLIC_LIQUIDITY_POOL_ADDRESS as `0x${string}`
export const BLTM_ADDRESS = process.env.NEXT_PUBLIC_BLTM_ADDRESS as `0x${string}`
export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`

if (!LIQUIDITY_POOL_ADDRESS || !BLTM_ADDRESS || !USDC_ADDRESS) {
  throw new Error("Required environment variables are not set")
}