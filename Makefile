.PHONY: setup deploy-contracts dev-frontend

# Setup dependencies for both frontend and contracts
setup:
	@echo "Installing dependencies..."
	@cd contracts && npm install
	@cd frontend && npm install

# Deploy contracts to Creditcoin Testnet
deploy-contracts:
	@cd contracts && npx hardhat run scripts/deploy.ts --network creditcoin

# Run frontend in development mode
dev-frontend:
	@cd frontend && npm run dev
