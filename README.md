# Vinicius Macelai Basic dApp for RWA Investing

A decentralized application (dApp) that enables users to invest in real-world assets (RWA) through a liquidity pool mechanism, allowing swapping between USDC and BLTM tokens.

## Technologies Used

- **Frontend**:
  - Next.js 15
  - TypeScript
  - TailwindCSS
  - shadcn/ui
  - Dynamic.xyz (Web3 Authentication)
  - wagmi/viem (Blockchain Interactions)

- **Smart Contracts**:
  - Solidity 0.8.22
  - OpenZeppelin Contracts
  - Foundry (Development Framework)

## Setup Instructions

### Frontend

1. Install dependencies: `bun install`
2. You need to have a Dynamic API key to run the frontend. You can get one by signing up at [Dynamic](https://dynamic.xyz/).
3. Create a `.env` file from `.env.example`
4. Start the development server: `bun dev`

### Smart Contracts

1. Install dependencies: `forge install`
2. Run tests: `forge test`
3. Generate coverage report: `forge coverage`
4. Deploy contracts: `forge script script/Deploy.s.sol:DeployScript --rpc-url <RPC_URL> --broadcast --verify -vvvv --private-key <PRIVATE_KEY> --legacy`

## Approach and Challenges

The smart contracts were developed within a one-hour, with the majority of development effort focused on the frontend implementation. The main challenges revolved around managing complex state transitions for token approvals and swaps, ensuring proper error handling and user feedback. While most critical issues have been addressed, there are opportunities for UX improvements. Current limitations include hardcoded block numbers for event fetching, which could be optimized through the implementation of an indexer or backend service to handle historical transaction data. The current RPC-based event querying can occasionally fail due to rate limiting and data volume constraints. With additional time, these aspects could be enhanced to provide a more robust and user-friendly experience.

## Security Analysis

Slither, a static analysis tool for Solidity, was run against the smart contracts to identify potential vulnerabilities. Through this analysis, a reentrancy vulnerability was identified and fixed by implementing the checks-effects-interactions pattern. Additionally, all ERC20 token interactions were updated to use OpenZeppelin's SafeERC20 library to prevent potential token handling issues and ensure secure token transfers.



## Smart Contract Coverage

| File | Line Coverage | Branch Coverage | Function Coverage |
|------|--------------|-----------------|-------------------|
| BLTM.sol | 100% (6/6) | - | 100% (6/6) |
| LiquidityPool.sol | 100% (20/20) | 100% (12/12) | 100% (4/4) |
