import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { argentWallet, trustWallet, ledgerWallet } from "@rainbow-me/rainbowkit/wallets";

const creditcoinTestnet = {
    id: 102031,
    name: "Creditcoin Testnet",
    iconUrl: "https://docs.creditcoin.org/img/logo.svg",
    iconBackground: "#fff",
    nativeCurrency: { name: "Creditcoin", symbol: "CTC", decimals: 18 },
    rpcUrls: {
        default: { http: ["https://rpc.cc3-testnet.creditcoin.network"] },
        public: { http: ["https://rpc.cc3-testnet.creditcoin.network"] },
    },
    blockExplorers: {
        default: { name: "Blockscout", url: "https://creditcoin-testnet.blockscout.com" },
    },
    testnet: true,
} as const;

export const config = getDefaultConfig({
    appName: "Creditcoin RWA Starter Kit",
    projectId: "YOUR_PROJECT_ID",
    chains: [creditcoinTestnet],
    ssr: true,
});
