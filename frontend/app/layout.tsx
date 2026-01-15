import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/Web3Provider";
import { cn } from "@/lib/utils";

// const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
    title: "Creditcoin RWA Starter Kit",
    description: "A boilerplate for RWA loans on Creditcoin",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={cn(
                "min-h-screen bg-background font-sans antialiased",
                // inter.variable // Font optimization if needed
            )}>
                <Web3Provider>
                    {children}
                </Web3Provider>
            </body>
        </html>
    );
}
