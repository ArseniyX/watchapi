export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "WatchAPI",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description:
      "Lightweight API monitoring and uptime tracking platform for development teams. Real-time alerts, performance analytics, and API testing.",
    url: "https://watchapi.dev",
    author: {
      "@type": "Organization",
      name: "WatchAPI",
      url: "https://watchapi.dev",
    },
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        name: "Free Plan",
        description: "5 endpoints, 15-minute checks, 7-day history",
      },
      {
        "@type": "Offer",
        price: "29",
        priceCurrency: "USD",
        name: "Team Plan",
        description:
          "50 endpoints, 1-minute checks, 30-day history, team collaboration",
      },
      {
        "@type": "Offer",
        price: "99",
        priceCurrency: "USD",
        name: "Business Plan",
        description:
          "Unlimited endpoints, 30-second checks, 90-day history, priority support",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "127",
    },
    featureList: [
      "Real-time API monitoring",
      "Uptime tracking",
      "Performance analytics",
      "Email and webhook alerts",
      "Team collaboration",
      "API testing",
      "Response time tracking",
      "Custom headers support",
      "Multi-environment support",
    ],
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "WatchAPI",
    url: "https://watchapi.dev",
    logo: "https://watchapi.dev/favicon.png",
    description:
      "API monitoring and uptime tracking platform for development teams",
    sameAs: ["https://twitter.com/watchapi", "https://github.com/watchapi"],
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@watchapi.dev",
      contactType: "Customer Support",
    },
  };

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "WatchAPI",
    url: "https://watchapi.dev",
    description:
      "Lightweight API monitoring and uptime tracking platform for development teams",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://watchapi.dev/app?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
    </>
  );
}
