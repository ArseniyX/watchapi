import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

                <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
                    <section>
                        <p className="text-muted-foreground text-lg mb-8">
                            Last updated:{" "}
                            {new Date().toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">
                            1. Acceptance of Terms
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            By accessing or using APIMonitor, you agree to be
                            bound by these Terms of Service. If you do not agree
                            to these terms, please do not use our service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">
                            2. Description of Service
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            APIMonitor provides API monitoring and testing
                            services, including:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Automated health checks for API endpoints</li>
                            <li>Real-time alerting via email and webhooks</li>
                            <li>Performance analytics and uptime tracking</li>
                            <li>Team collaboration features</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">
                            3. User Accounts
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            You are responsible for:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>
                                Maintaining the security of your account
                                credentials
                            </li>
                            <li>
                                All activities that occur under your account
                            </li>
                            <li>
                                Notifying us immediately of any unauthorized
                                access
                            </li>
                            <li>Providing accurate and current information</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">
                            4. Acceptable Use
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            You agree not to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>
                                Use the service to monitor APIs without proper
                                authorization
                            </li>
                            <li>
                                Attempt to disrupt or overload our
                                infrastructure
                            </li>
                            <li>
                                Use the service for any illegal or unauthorized
                                purpose
                            </li>
                            <li>
                                Reverse engineer or attempt to extract our
                                source code
                            </li>
                            <li>
                                Share your account credentials with unauthorized
                                users
                            </li>
                            <li>Violate any applicable laws or regulations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">
                            5. Subscription and Billing
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Free Plan:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                            <li>No credit card required</li>
                            <li>Limited to 5 endpoints and basic features</li>
                            <li>Can be upgraded at any time</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Paid Plans:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Billed monthly or annually in advance</li>
                            <li>14-day free trial available</li>
                            <li>Automatic renewal unless cancelled</li>
                            <li>
                                Refunds available within 14 days of initial
                                purchase
                            </li>
                            <li>
                                Cancellation takes effect at the end of the
                                billing period
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">
                            6. Service Availability
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We strive to maintain high availability but do not
                            guarantee uninterrupted service. We may:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>
                                Perform scheduled maintenance with advance
                                notice
                            </li>
                            <li>Experience unexpected downtime</li>
                            <li>
                                Modify or discontinue features with reasonable
                                notice
                            </li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            We target 99.9% uptime but are not liable for
                            service interruptions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">
                            7. Data and Privacy
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Your use of the service is also governed by our
                            Privacy Policy. We collect and use data as described
                            in that policy. You retain all rights to your data
                            and can export or delete it at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">
                            8. Intellectual Property
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            The service, including all software, design, and
                            content, is owned by APIMonitor and protected by
                            intellectual property laws. You may not:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Copy, modify, or distribute our software</li>
                            <li>Use our trademarks without permission</li>
                            <li>
                                Create derivative works based on our service
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">
                            9. Limitation of Liability
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            To the maximum extent permitted by law:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>
                                We provide the service "as is" without
                                warranties
                            </li>
                            <li>
                                We are not liable for indirect or consequential
                                damages
                            </li>
                            <li>
                                Our total liability is limited to the amount you
                                paid in the last 12 months
                            </li>
                            <li>
                                We are not responsible for damages caused by
                                your API endpoints or third-party services
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">
                            10. Indemnification
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            You agree to indemnify and hold harmless APIMonitor
                            from any claims, damages, or expenses arising from
                            your use of the service or violation of these terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">
                            11. Termination
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We may suspend or terminate your account if you:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Violate these terms</li>
                            <li>Fail to pay for services</li>
                            <li>Engage in fraudulent activity</li>
                            <li>Remain inactive for an extended period</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            You may cancel your account at any time from your
                            account settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">
                            12. Changes to Terms
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We may update these terms from time to time.
                            Material changes will be communicated via email or
                            through the service. Continued use of the service
                            after changes constitutes acceptance.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">
                            13. Governing Law
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            These terms are governed by the laws of the
                            jurisdiction where APIMonitor is registered. Any
                            disputes will be resolved in the courts of that
                            jurisdiction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">
                            14. Contact
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Questions about these terms? Contact us at{" "}
                            <a
                                href="mailto:legal@watchapi.dev"
                                className="text-primary hover:underline"
                            >
                                legal@watchapi.dev
                            </a>
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
