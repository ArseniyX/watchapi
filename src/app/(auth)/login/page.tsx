"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Github, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Logo } from "@/components/logo";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState(
        process.env.NODE_ENV === "development" ? "demo@watchapi.dev" : ""
    );
    const [password, setPassword] = useState(
        process.env.NODE_ENV === "development" ? "demo123" : ""
    );
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { user, login, loginWithOAuth } = useAuth();
    const { toast } = useToast();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            router.replace("/app");
        }
    }, [user, router]);

    // Handle OAuth callback - runs immediately, no render
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const oauthSuccess = urlParams.get("oauth_success");

        if (oauthSuccess) {
            const accessToken = urlParams.get("access_token");
            const refreshToken = urlParams.get("refresh_token");

            if (accessToken && refreshToken) {
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
                // Immediate redirect, no state update
                window.location.replace("/app");
                return;
            }
        }

        const error = urlParams.get("error");
        if (error) {
            const details = urlParams.get("details");
            toast({
                title: "Authentication failed",
                description: details ? `${error}: ${details}` : `OAuth error: ${error}`,
                variant: "destructive",
            });
            window.history.replaceState({}, "", "/login");
        }
    }, [toast]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(email, password);
            toast({
                title: "Success",
                description: "Welcome back!",
            });
            router.push("/app");
        } catch (error) {
            toast({
                title: "Login failed",
                description:
                    error instanceof Error
                        ? error.message
                        : "Invalid email or password",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 flex-col gap-4">
            <Link href="/">
                <Logo />
            </Link>
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Welcome back</CardTitle>
                    <CardDescription>
                        Sign in to your account to continue
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-primary transition-colors"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                        {/* <div className="flex items-center justify-between">
                            <Link
                                href="/forgot-password"
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Forgot password?
                            </Link>
                        </div> */}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            onClick={() => loginWithOAuth("github")}
                            type="button"
                        >
                            <Github className="mr-2 h-4 w-4" />
                            GitHub
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => loginWithOAuth("google")}
                            type="button"
                        >
                            <Mail className="mr-2 h-4 w-4" />
                            Google
                        </Button>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">
                            Don&apos;t have an account?{" "}
                        </span>
                        <Link
                            href="/signup"
                            className="text-primary hover:underline"
                        >
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
