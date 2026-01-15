import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config({ path: "../.env.example" }); // Load from root .env or .env.example

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    creditcoin: {
      url: process.env.CREDITCOIN_RPC_URL || "https://rpc.cc3-testnet.creditcoin.network",
      chainId: 102031,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  sourcify: {
    enabled: true
  },
  etherscan: {
    apiKey: {
        creditcoin: "empty"
    },
    customChains: [
      {
        network: "creditcoin",
        chainId: 102031,
        urls: {
          apiURL: "https://creditcoin-testnet.blockscout.com/api",
          browserURL: "https://creditcoin-testnet.blockscout.com",
        },
      },
    ],
  },
};

export default config;
