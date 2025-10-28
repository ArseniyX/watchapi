import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const sections = [
  {
    title: "1. Welcome",
    body: [
      "API Monitoring helps you keep every customer-facing API fast, reliable, and transparent. Use this guide to learn how to track performance, receive incident alerts, and collaborate with your team.",
    ],
  },
  {
    title: "2. Getting Started",
    bullets: [
      "Create your workspace: sign up and invite teammates from the onboarding modal.",
      "Add your first endpoint: choose `Add Endpoint`, paste the URL, and set check frequency, timeout, and expected status.",
      "Verify monitoring: run a manual check or wait for the first scheduled probe to confirm data collection.",
      "Configure alerts: add an email or webhook destination, then trigger a test alert to ensure delivery.",
      "Organize endpoints: group related services into collections for easier reporting and access control.",
    ],
  },
  {
    title: "3. Monitoring Dashboard",
    bullets: [
      "Overview cards show current uptime, average latency, and error rate across your workspace.",
      "Response time charts visualize trends with hover-to-inspect for granular metrics.",
      "Status timeline highlights recent incidents and recoveries so you can spot regression windows.",
      "Filters let you slice data by collection, severity, or specific endpoint.",
      "Export the latest run history or share a live link with stakeholders who need read-only access.",
    ],
  },
  {
    title: "4. Collections & Collaboration",
    bullets: [
      "Collections group endpoints by product area, environment, or ownership team.",
      "Assign roles (Viewer, Editor, Admin) to manage who can update checks or alert rules.",
      "Comments on incidents capture context and remediation steps for future reference.",
      "Activity feed tracks configuration changes so audits and postmortems stay simple.",
      "Workspace search surfaces endpoints, incidents, and runbooks instantly.",
    ],
  },
  {
    title: "5. Alerts & Notifications",
    bullets: [
      "Choose from email, Slack, Discord, or generic webhooks to deliver alerts where your team works.",
      "Set failure thresholds (e.g., 3 failed checks in 5 minutes) to prevent noisy notifications.",
      "Use quiet hours to pause alerts during maintenance windows without disabling monitoring.",
      "Escalate unresolved incidents by chaining multiple channels with custom delays.",
      "Recoveries trigger follow-up messages so teams know when service health is restored.",
    ],
  },
  {
    title: "6. Analytics & Reporting",
    bullets: [
      "Latency breakdowns reveal p95 response time per endpoint or collection.",
      "Uptime reports summarize SLA performance over weekly or monthly periods.",
      "Error analysis surfaces the most common failure codes and payload sizes.",
      "Scheduled email summaries keep stakeholders informed without logging in.",
      "Download CSV exports for internal reviews or compliance reporting.",
    ],
  },
  {
    title: "7. Billing & Usage",
    bullets: [
      "Free tier monitors up to 5 endpoints with 1-minute checks and email alerts.",
      "Team and Business plans unlock faster intervals, advanced analytics, and premium support.",
      "Usage dashboard tracks endpoint count, alert volume, and data retention in real time.",
      "Upgrade or downgrade anytime from `Settings → Billing` without service interruption.",
      "Invoices and receipts are available for download by workspace admins.",
    ],
  },
  {
    title: "8. FAQs & Support",
    bullets: [
      "Need help? Email `support@watchapi.dev` or open an in-app ticket under `Help → Contact`.",
      "Status page at `status.watchapi.dev` publishes real-time platform availability.",
      "Visit the changelog (upper-right menu) for feature releases and fixes.",
      "Join the community Slack for best practices, templates, and roadmap previews.",
      "Enterprise onboarding includes white-glove setup and custom reporting—reach out for details.",
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-4xl font-bold">Platform Documentation</h1>
        <p className="text-muted-foreground text-lg">
          A customer guide to getting value from the API Monitoring Platform,
          from onboarding to analytics, alerts, and billing.
        </p>

        <div className="prose prose-gray mt-10 max-w-none space-y-10 dark:prose-invert">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-semibold">{section.title}</h2>
              {section.body?.map((paragraph) => (
                <p key={paragraph} className="text-muted-foreground">
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-4 list-disc space-y-2 pl-6">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="text-muted-foreground">
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
