"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatEther } from "viem";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useEffect } from "react";

// Mock ABI for interactions
const ABI = [
    {
        "inputs": [{ "internalType": "uint256", "name": "_loanId", "type": "uint256" }],
        "name": "fundLoan",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_loanId", "type": "uint256" }],
        "name": "repayLoan",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
] as const;

// Types based on the Contract Struct
export type LoanStatus = "PENDING" | "ACTIVE" | "REPAID" | "DEFAULTED";

export interface Loan {
    id: bigint;
    borrower: string;
    lender: string;
    amount: bigint;
    dueDate: bigint;
    status: number; // 0, 1, 2, 3 mapped to Enum
}

interface LoanCardProps {
    loan: Loan;
    contractAddress: `0x${string}`;
    refreshData?: () => void;
}

const statusMap = ["PENDING", "ACTIVE", "REPAID", "DEFAULTED"];

export function LoanCard({ loan, contractAddress, refreshData }: LoanCardProps) {
    const { address } = useAccount();
    const { data: hash, writeContract, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const statusLabel = statusMap[loan.status];
    const isBorrower = address && loan.borrower.toLowerCase() === address.toLowerCase();
    const isLender = address && loan.lender.toLowerCase() === address.toLowerCase();

    useEffect(() => {
        if (isSuccess && refreshData) {
            refreshData();
        }
    }, [isSuccess, refreshData]);

    const handleFund = () => {
        writeContract({
            address: contractAddress,
            abi: ABI,
            functionName: "fundLoan",
            args: [loan.id],
            value: loan.amount, // Sending the loan amount
        });
    };

    const handleRepay = () => {
        // Calculate interest (5% simple for demo)
        const interest = (loan.amount * 5n) / 100n;
        const totalRepayment = loan.amount + interest;

        writeContract({
            address: contractAddress,
            abi: ABI,
            functionName: "repayLoan",
            args: [loan.id],
            value: totalRepayment,
        });
    };

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Loan #{loan.id.toString()}</CardTitle>
                    <Badge variant={statusLabel === "ACTIVE" ? "default" : "secondary"}>
                        {statusLabel}
                    </Badge>
                </div>
                <CardDescription>Borrower: {loan.borrower.slice(0, 6)}...{loan.borrower.slice(-4)}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                        <span className="font-bold text-2xl">{formatEther(loan.amount)} CTC</span>
                        <span className="text-sm text-muted-foreground">Term: 30 Days</span>
                        {statusLabel === "ACTIVE" && (
                            <span className="text-xs text-green-600">Due Date: {new Date(Number(loan.dueDate) * 1000).toLocaleDateString()}</span>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                {/* Marketplace View Logic: Pending Loan */}
                {statusLabel === "PENDING" && (
                    <Button
                        className="w-full"
                        disabled={isBorrower || isPending || isConfirming}
                        onClick={handleFund}
                    >
                        {isPending || isConfirming ? "Processing..." : (isBorrower ? "Your Request" : "Fund Loan")}
                    </Button>
                )}

                {/* Dashboard View Logic: Active Loan (Repay) */}
                {statusLabel === "ACTIVE" && isBorrower && (
                    <Button
                        className="w-full"
                        variant="destructive"
                        disabled={isPending || isConfirming}
                        onClick={handleRepay}
                    >
                        {isPending || isConfirming ? "Processing..." : "Repay Loan (+5% INT)"}
                    </Button>
                )}

                {/* Dashboard View Logic: Active Loan (Lender View) */}
                {statusLabel === "ACTIVE" && isLender && (
                    <Button variant="outline" className="w-full" disabled>
                        Funded - Earning Interest
                    </Button>
                )}

                {statusLabel === "REPAID" && (
                    <Button variant="secondary" className="w-full" disabled>
                        Loan Repaid
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
