import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { TRPCProvider } from "../components/providers/trpc-provider";
import { AuthProvider } from "../components/providers/auth-provider";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
    title: "APIMonitor - Lightweight API Monitoring & Testing",
    description:
        "A simpler, more affordable alternative to Postman and DataDog for small teams.",
    generator: "v0.app",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body
                className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}
            >
                <TRPCProvider>
                    <AuthProvider>
                        <Suspense fallback={null}>{children}</Suspense>
                        <Toaster />
                    </AuthProvider>
                </TRPCProvider>
                <Analytics />
            </body>
        </html>
    );
}
