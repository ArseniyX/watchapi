import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import Script from "next/script";
import { TRPCProvider } from "../components/providers/trpc-provider";
import { AuthProvider } from "../components/providers/auth-provider";
import { ThemeProvider } from "../components/providers/theme-provider";
import { Toaster } from "@/components/ui/toast";
import { StructuredData } from "@/components/structured-data";
import "./globals.css";

export const metadata: Metadata = {
    title: {
        default: "WatchAPI - Affordable API Monitoring & Uptime Tracking for Small Teams",
        template: "%s | WatchAPI",
    },
    description:
        "Lightweight API monitoring and uptime tracking platform for development teams. Real-time alerts, performance analytics, and API testing - a simpler, more affordable alternative to Postman and DataDog. Free plan available.",
    keywords: [
        "API monitoring",
        "uptime monitoring",
        "API testing",
        "API health check",
        "endpoint monitoring",
        "performance monitoring",
        "API analytics",
        "Postman alternative",
        "DataDog alternative",
        "API uptime tracking",
        "REST API monitoring",
        "API status monitoring",
        "website monitoring",
        "API response time",
        "real-time alerts",
        "API reliability",
        "SaaS monitoring",
        "affordable API monitoring",
        "API monitoring for small teams",
        "API error tracking",
    ],
    authors: [{ name: "WatchAPI" }],
    creator: "WatchAPI",
    publisher: "WatchAPI",
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://watchapi.dev'),
    alternates: {
        canonical: '/',
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: '/',
        siteName: 'WatchAPI',
        title: 'WatchAPI - Affordable API Monitoring & Uptime Tracking for Small Teams',
        description: 'Lightweight API monitoring and uptime tracking platform for development teams. Real-time alerts, performance analytics, and API testing - a simpler, more affordable alternative to Postman and DataDog.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'WatchAPI - API Monitoring Platform',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'WatchAPI - Affordable API Monitoring & Uptime Tracking',
        description: 'Lightweight API monitoring platform for small teams. Real-time alerts, performance analytics, and uptime tracking.',
        images: ['/og-image.png'],
        creator: '@watchapi',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'your-google-verification-code',
        yandex: 'your-yandex-verification-code',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    const theme = localStorage.getItem('theme') || 'dark';
                                    const root = document.documentElement;
                                    root.classList.remove('light', 'dark');
                                    if (theme === 'system') {
                                        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                                        root.classList.add(systemTheme);
                                    } else {
                                        root.classList.add(theme);
                                    }
                                } catch (e) {}
                            })();
                        `,
                    }}
                />
                <link
                    style={{
                        borderRadius: "0.5rem",
                    }}
                    rel="icon"
                    href="/favicon.png"
                />
                <StructuredData />
            </head>
            <body
                className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}
            >
                <TRPCProvider>
                    <AuthProvider>
                        <ThemeProvider>
                            <Suspense fallback={null}>{children}</Suspense>
                            <Toaster />
                        </ThemeProvider>
                    </AuthProvider>
                </TRPCProvider>
                <Analytics />
                <Script
                    defer
                    src="https://cloud.umami.is/script.js"
                    data-website-id="b5d3961e-dfe3-4d62-9c70-c1a3103033db"
                    strategy="afterInteractive"
                />
                <Script
                    id="crisp-chat"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                            window.$crisp=[];
                            window.CRISP_WEBSITE_ID="f0ba5698-e1de-49cb-bbf9-d4b61a7d71eb";
                            (function(){
                                d=document;
                                s=d.createElement("script");
                                s.src="https://client.crisp.chat/l.js";
                                s.async=1;
                                d.getElementsByTagName("head")[0].appendChild(s);
                            })();
                        `,
                    }}
                />
            </body>
        </html>
    );
}
