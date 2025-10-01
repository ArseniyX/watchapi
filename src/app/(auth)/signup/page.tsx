"use client";

import type React from "react";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Github, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { useAuth } from "@/lib/auth";

export default function SignupPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        company: "",
        agreeToTerms: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { loginWithOAuth } = useAuth();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Mock signup - simulate API call
        setTimeout(() => {
            setIsLoading(false);
            router.push("/app");
        }, 1000);
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 flex-col gap-4">
            <Logo />
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">
                        Create your account
                    </CardTitle>
                    <CardDescription>
                        Start monitoring your APIs in minutes
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) =>
                                    handleInputChange("name", e.target.value)
                                }
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@company.com"
                                value={formData.email}
                                onChange={(e) =>
                                    handleInputChange("email", e.target.value)
                                }
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company">Company (Optional)</Label>
                            <Input
                                id="company"
                                type="text"
                                placeholder="Your Company"
                                value={formData.company}
                                onChange={(e) =>
                                    handleInputChange("company", e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "password",
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="terms"
                                checked={formData.agreeToTerms}
                                onCheckedChange={(checked) =>
                                    handleInputChange(
                                        "agreeToTerms",
                                        checked as boolean
                                    )
                                }
                            />
                            <Label htmlFor="terms" className="text-sm">
                                I agree to the{" "}
                                <Link
                                    href="/terms"
                                    className="text-primary hover:underline"
                                >
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link
                                    href="/privacy"
                                    className="text-primary hover:underline"
                                >
                                    Privacy Policy
                                </Link>
                            </Label>
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading || !formData.agreeToTerms}
                        >
                            {isLoading
                                ? "Creating account..."
                                : "Create account"}
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
                            Already have an account?{" "}
                        </span>
                        <Link
                            href="/login"
                            className="text-primary hover:underline"
                        >
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
