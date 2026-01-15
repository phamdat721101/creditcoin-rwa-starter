"use client";

import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS, SIMPLE_LOAN_ABI } from "@/lib/constants";
import { Loan, LoanCard } from "@/components/LoanCard";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Need to create Input
import { useState, useEffect } from "react";
import { parseEther } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
    const { address } = useAccount();
    const [amount, setAmount] = useState("");

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    // 1. Get total loan count
    const { data: loanCount, refetch: refetchCount } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: SIMPLE_LOAN_ABI,
        functionName: "loanCount",
    });

    // 2. Fetch all loans
    const count = loanCount ? Number(loanCount) : 0;
    const loanContracts = Array.from({ length: count }, (_, i) => ({
        address: CONTRACT_ADDRESS,
        abi: SIMPLE_LOAN_ABI,
        functionName: "getLoanById",
        args: [BigInt(i + 1)],
    }));

    const { data: loansData, refetch: refetchLoans } = useReadContracts({
        contracts: loanContracts,
    });

    useEffect(() => {
        if (isSuccess) {
            setAmount("");
            refetchCount();
            refetchLoans();
        }
    }, [isSuccess, refetchCount, refetchLoans]);

    const loans = loansData?.map(r => r.result).filter(Boolean) as Loan[] || [];

    const myBorrows = loans.filter(l => l.borrower.toLowerCase() === address?.toLowerCase());
    const myInvestments = loans.filter(l => l.lender.toLowerCase() === address?.toLowerCase());

    const totalInterest = myInvestments.reduce((acc, loan) => {
        // If Repaid (Status 2), we earned interest. 
        if (loan.status === 2) {
            return acc + (loan.amount * 5n / 100n);
        }
        return acc;
    }, 0n);

    const handleRequestLoan = () => {
        if (!amount) return;
        writeContract({
            address: CONTRACT_ADDRESS,
            abi: SIMPLE_LOAN_ABI,
            functionName: "createLoanRequest",
            args: [parseEther(amount)],
        });
    };

    if (!address) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-24">
                <h1 className="text-2xl mb-4">Please Connect Wallet</h1>
                <ConnectButton />
            </main>
        );
    }

    return (
        <main className="flex min-h-screen flex-col items-center p-24">
            <div className="z-10 max-w-5xl w-full flex justify-between items-center text-sm lg:flex mb-12">
                <h1 className="text-4xl font-bold">User Dashboard</h1>
                <div className="flex gap-4 items-center">
                    <Link href="/"><Button variant="outline">Marketplace</Button></Link>
                    <ConnectButton />
                </div>
            </div>

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Loan Section */}
                <div className="col-span-1">
                    <Card>
                        <CardHeader><CardTitle>Request a Loan</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Amount (CTC)</label>
                                <input
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    type="number"
                                    placeholder="e.g. 100"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                            <Button className="w-full" onClick={handleRequestLoan} disabled={isPending || isConfirming}>
                                {isPending || isConfirming ? "Creating..." : "Create Request"}
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="mt-8">
                        <h3 className="text-xl font-bold mb-4">Stats</h3>
                        <div className="bg-secondary p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Interest Earned</p>
                            <p className="text-2xl font-bold text-green-600">
                                {Number(totalInterest) / 1e18} CTC
                            </p>
                        </div>
                    </div>
                </div>

                {/* My Activity Section */}
                <div className="col-span-1 lg:col-span-2 space-y-8">
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">My Borrows</h2>
                        {myBorrows.length === 0 ? <p className="text-muted-foreground">No active loans.</p> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {myBorrows.map(loan => (
                                    <LoanCard key={loan.id.toString()} loan={loan} contractAddress={CONTRACT_ADDRESS} refreshData={refetchLoans} />
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold mb-4">My Investments</h2>
                        {myInvestments.length === 0 ? <p className="text-muted-foreground">No investments yet.</p> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {myInvestments.map(loan => (
                                    <LoanCard key={loan.id.toString()} loan={loan} contractAddress={CONTRACT_ADDRESS} refreshData={refetchLoans} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
