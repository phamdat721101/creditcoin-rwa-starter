"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { CONTRACT_ADDRESS, SIMPLE_LOAN_ABI } from "@/lib/constants";
import { Loan, LoanCard } from "@/components/LoanCard";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
    // 1. Get total loan count
    const { data: loanCount } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: SIMPLE_LOAN_ABI,
        functionName: "loanCount",
    });

    // 2. Prepare contracts config for all IDs
    const count = loanCount ? Number(loanCount) : 0;
    const loanContracts = Array.from({ length: count }, (_, i) => ({
        address: CONTRACT_ADDRESS,
        abi: SIMPLE_LOAN_ABI,
        functionName: "getLoanById",
        args: [BigInt(i + 1)],
    }));

    // 3. Fetch all loans
    const { data: loansData, refetch } = useReadContracts({
        contracts: loanContracts,
    });

    // 4. Filter Pending Loans
    const loans = loansData?.map(r => r.result).filter(Boolean) as Loan[] || [];
    const pendingLoans = loans.filter(l => l.status === 0); // 0 = PENDING

    return (
        <main className="flex min-h-screen flex-col items-center p-24">
            <div className="z-10 max-w-5xl w-full flex justify-between items-center text-sm lg:flex">
                <h1 className="text-4xl font-bold">Creditcoin Marketplace</h1>
                <div className="flex gap-4 items-center">
                    <Link href="/dashboard"><Button variant="outline">Dashboard</Button></Link>
                    <ConnectButton />
                </div>
            </div>

            <div className="mt-12 w-full max-w-5xl">
                <h2 className="text-2xl font-semibold mb-6">Open Requests</h2>

                {pendingLoans.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        No pending loans found. Go to Dashboard to create one!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingLoans.map((loan) => (
                            <LoanCard
                                key={loan.id.toString()}
                                loan={loan}
                                contractAddress={CONTRACT_ADDRESS}
                                refreshData={refetch}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
