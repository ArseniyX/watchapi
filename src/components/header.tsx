import Link from "next/link";
import { MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "./logo";

export function Header() {
  const navigationLinks = [
    { href: "/#features", label: "Features" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  data-umami-event="nav-menu-open"
                >
                  <MenuIcon className="size-5" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex w-72 flex-col gap-0 p-0">
                <div className="border-b px-4 py-4">
                  <Link href="/" className="flex items-center space-x-2">
                    <Logo />
                  </Link>
                </div>
                <nav className="flex flex-col gap-2 px-4 py-6">
                  {navigationLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="text-lg font-medium text-foreground/80 transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <div className="mt-auto border-t px-4 py-6">
                  <div className="flex flex-col gap-3">
                    <SheetClose asChild>
                      <Link href="/login">
                        <Button
                          variant="outline"
                          className="w-full"
                          data-umami-event="nav-signin"
                        >
                          Sign In
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/signup">
                        <Button className="w-full" data-umami-event="nav-get-started">
                          Get Started
                        </Button>
                      </Link>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center space-x-2">
              <Logo />
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2 md:space-x-4">
            <Link href="/login">
              <Button variant="ghost" data-umami-event="nav-signin">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button data-umami-event="nav-get-started">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
