import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
    return (
        <section className="relative py-20 sm:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl text-balance">
                        Lightweight API Monitoring & Testing for Small Teams
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground text-pretty max-w-2xl mx-auto">
                        A simpler, more affordable alternative to Postman and
                        DataDog. Monitor your APIs in real-time, integrate with
                        your CI/CD pipeline, and collaborate with your team.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link href="/signup">
                            <Button size="lg" className="px-8">
                                Start Free
                            </Button>
                        </Link>
                        <Link href="/demo">
                            <Button
                                variant="outline"
                                size="lg"
                                className="px-8 bg-transparent"
                            >
                                Request Demo
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
