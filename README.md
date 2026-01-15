# Creditcoin RWA Starter Kit

A "batteries-included" boilerplate for building Real-World Asset (RWA) applications on the Creditcoin Testnet. This starter kit includes a Hardhat-based smart contract project and a Next.js frontend pre-configured with Wagmi, RainbowKit, and TailwindCSS.

## Features

- **Smart Contracts**: `SimpleLoan.sol` example contract for creating, funding, and repaying loans.
- **Frontend**: 
  - **Marketplace**: View and fund open loan requests.
  - **User Dashboard**: Create loan requests, view borrowings, and track investments.
  - **Wallet Connection**: Integrated with RainbowKit (supports Metamask, etc.).
- **Dev Tools**: configured with TypeScript, Hardhat, and basic CI/CD scripts.

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Make](https://www.gnu.org/software/make/) (optional, for using the Makefile)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd credit-coin/repo
```

### 2. Install Dependencies

You can install dependencies for both the contracts and frontend using the provided Makefile command:

```bash
make setup
```

Or manually:

```bash
cd contracts && npm install
cd ../frontend && npm install
```

### 3. Environment Setup

Copy the example environment file and fill in your details:

```bash
cp .env.example .env
```

Open `.env` and configure:

- `PRIVATE_KEY`: Your wallet's private key (Exported from Metamask). **Do not share this!**
- `CREDITCOIN_RPC_URL`: Default is `https://rpc.cc3-testnet.creditcoin.network`.
- `BLOCKSCOUT_API_KEY`: (Optional) For verifying contracts on the block explorer.

### 4. Deploy Smart Contracts

Deploy the `SimpleLoan` contract to the Creditcoin Testnet:

```bash
make deploy-contracts
```

This command runs the `scripts/deploy.ts` script using Hardhat.
**Important:** After deployment, the console will output the deployed contract address. **Copy this address.**

Example output:
```
SimpleLoan deployed to: 0x1234...abcd
```

### 5. Configure Frontend

1. Open `frontend/lib/constants.ts`.
2. Replace the `CONTRACT_ADDRESS` value with the address you copied in the previous step.

```typescript
// frontend/lib/constants.ts
export const CONTRACT_ADDRESS = "0xYourDeployedAddressHere";
```

3. (Optional) Get a WalletConnect Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/) and update `frontend/lib/wagmi.ts` if you want to avoid rate limits or use custom wallet branding.

### 6. Run the Application

Start the frontend development server:

```bash
make dev-frontend
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── Makefile                # Orchestration commands
├── .env.example            # Environment variables template
├── contracts/              # Hardhat project
│   ├── contracts/          # Solidity smart contracts
│   ├── scripts/            # Deployment scripts
│   ├── test/               # Contract tests
│   └── hardhat.config.ts   # Hardhat configuration
└── frontend/               # Next.js Application
    ├── app/                # App Router pages (Home, Dashboard)
    ├── components/         # UI Components
    ├── lib/                # Utilities, Constants, Wagmi Config
    └── public/             # Static assets
```

## Testing

**Smart Contracts:**
Run the test suite to verify contract logic:

```bash
cd contracts
npx hardhat test
```

## Verification

To verify your contract source code on Blockscout:

```bash
npx hardhat verify --network creditcoin <DEPLOYED_ADDRESS>
```

*(Make sure you have set `BLOCKSCOUT_API_KEY` in your `.env` if required, though Creditcoin Blockscout standard verification usually works without it depending on the config).*
