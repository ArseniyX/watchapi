import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

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
              1. Information We Collect
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We collect information you provide directly to us when you create
              an account, configure API endpoints for monitoring, or contact us
              for support.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Account information (email, name, password)</li>
              <li>
                API endpoint configurations (URLs, headers, expected responses)
              </li>
              <li>
                Monitoring data (response times, status codes, uptime
                statistics)
              </li>
              <li>Usage data (features used, monitoring activity)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide and maintain our API monitoring services</li>
              <li>
                Send you alerts and notifications about your API endpoints
              </li>
              <li>Improve and optimize our platform</li>
              <li>
                Communicate with you about updates, security alerts, and support
              </li>
              <li>Detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              3. Data Storage and Security
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We take data security seriously and implement industry-standard
              measures to protect your information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>All data is encrypted in transit using TLS/SSL</li>
              <li>Passwords are hashed using bcrypt</li>
              <li>
                API credentials and sensitive headers are encrypted at rest
              </li>
              <li>Regular security audits and updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your monitoring data according to your subscription
              plan:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Free plan: 7 days of monitoring history</li>
              <li>Team plan: 30 days of monitoring history</li>
              <li>Business plan: 90 days of monitoring history</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Account information is retained until you delete your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              5. Third-Party Services
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the following third-party services to operate our platform:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Email delivery services for sending alerts</li>
              <li>Cloud hosting providers for infrastructure</li>
              <li>Analytics tools to improve our service</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We do not sell or share your personal information with third
              parties for their marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access and download your data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and associated data</li>
              <li>Opt-out of marketing communications</li>
              <li>Request data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use essential cookies to maintain your session and remember
              your preferences. We do not use tracking cookies or third-party
              advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              8. Children's Privacy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our service is not intended for users under the age of 13. We do
              not knowingly collect information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              9. Changes to This Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this privacy policy from time to time. We will
              notify you of any significant changes by email or through our
              platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this privacy policy or our data
              practices, please contact us at{" "}
              <a
                href="mailto:privacy@watchapi.dev"
                className="text-primary hover:underline"
              >
                privacy@watchapi.dev
              </a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
