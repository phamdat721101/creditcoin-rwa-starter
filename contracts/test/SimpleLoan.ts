import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SimpleLoan", function () {
    async function deploySimpleLoanFixture() {
        const [owner, borrower, lender, otherAccount] = await ethers.getSigners();
        const SimpleLoan = await ethers.getContractFactory("SimpleLoan");
        const simpleLoan = await SimpleLoan.deploy();
        return { simpleLoan, owner, borrower, lender, otherAccount };
    }

    describe("Deployment", function () {
        it("Should start with loanCount 0", async function () {
            const { simpleLoan } = await loadFixture(deploySimpleLoanFixture);
            expect(await simpleLoan.loanCount()).to.equal(0);
        });
    });

    describe("Loan Lifecycle", function () {
        it("Should allow a borrower to create a loan request", async function () {
            const { simpleLoan, borrower } = await loadFixture(deploySimpleLoanFixture);
            const amount = ethers.parseEther("100");

            await expect(simpleLoan.connect(borrower).createLoanRequest(amount))
                .to.emit(simpleLoan, "LoanRequested")
                .withArgs(1, borrower.address, amount);

            const loan = await simpleLoan.getLoanById(1);
            expect(loan.borrower).to.equal(borrower.address);
            expect(loan.amount).to.equal(amount);
            expect(loan.status).to.equal(0); // PENDING
        });

        it("Should allow a lender to fund a loan", async function () {
            const { simpleLoan, borrower, lender } = await loadFixture(deploySimpleLoanFixture);
            const amount = ethers.parseEther("100");

            await simpleLoan.connect(borrower).createLoanRequest(amount);

            await expect(simpleLoan.connect(lender).fundLoan(1, { value: amount }))
                .to.emit(simpleLoan, "LoanFunded")
                .withArgs(1, lender.address);

            const loan = await simpleLoan.getLoanById(1);
            expect(loan.lender).to.equal(lender.address);
            expect(loan.status).to.equal(1); // ACTIVE
        });

        it("Should allow repayment of a loan", async function () {
            const { simpleLoan, borrower, lender } = await loadFixture(deploySimpleLoanFixture);
            const amount = ethers.parseEther("100");

            await simpleLoan.connect(borrower).createLoanRequest(amount);
            await simpleLoan.connect(lender).fundLoan(1, { value: amount });

            // Calculate interest (5%)
            const interest = (amount * 5n) / 100n;
            const totalRepayment = amount + interest;

            // We can't easily predict the exact timestamp for the event, but we can check the state change
            await simpleLoan.connect(borrower).repayLoan(1, { value: totalRepayment });

            const loan = await simpleLoan.getLoanById(1);
            expect(loan.status).to.equal(2); // REPAID
        });
    });
});
