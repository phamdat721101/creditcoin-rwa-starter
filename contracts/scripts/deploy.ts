import { ethers } from "hardhat";

async function main() {
    console.log("Deploying SimpleLoan contract...");

    const simpleLoan = await ethers.deployContract("SimpleLoan");

    await simpleLoan.waitForDeployment();

    const address = await simpleLoan.getAddress();

    console.log(`SimpleLoan deployed to: ${address}`);
    console.log(`Verify with: npx hardhat verify --network creditcoin ${address}`);

    // Optional: Auto-verify if API key is present (Verification usually needs wait time)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
