import Link from "next/link";
import { Logo } from "./logo";

const footerLinks = {
  Product: [
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Compare", href: "/compare" },
  ],
  Resources: [
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ],
  Company: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4 max-w-xs">
            <Logo className="-ml-2" />
            <p className="text-muted-foreground text-sm leading-relaxed">
              Lightweight API monitoring and testing for small teams. Simple,
              affordable, and powerful.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-8 sm:flex sm:flex-wrap sm:gap-x-16 sm:gap-y-10">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="min-w-[120px]">
                <h3 className="font-semibold text-foreground mb-4">
                  {category}
                </h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 WatchAPI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
