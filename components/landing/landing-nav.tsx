"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import ModeToggle from "@/components/utility/mode-toggle";
import { APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
];

/** Top bar for the public site. Turns solid once the page scrolls. */
export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // The page scrolls inside its own container, so listen for scrolling anywhere.
  useEffect(() => {
    const onScroll = (event: Event) => {
      const target = event.target;
      const top = target instanceof Element ? target.scrollTop : window.scrollY;
      setScrolled(top > 8);
    };
    document.addEventListener("scroll", onScroll, {
      capture: true,
      passive: true,
    });
    return () =>
      document.removeEventListener("scroll", onScroll, { capture: true });
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 transition-colors duration-300",
        scrolled || open
          ? "border-border bg-background/80 border-b backdrop-blur-lg"
          : "border-b border-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" aria-label={`${APP_NAME} home`} className="text-lg">
          <Logo name={APP_NAME} />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:block">
            <ModeToggle />
          </div>
          {/* Sign in goes to Clerk once accounts exist; for now it opens the app. */}
          <Link
            href="/charts"
            className="text-muted-foreground hover:text-foreground hidden rounded-full px-3 py-1.5 text-sm font-medium transition-colors md:block"
          >
            Sign in
          </Link>
          <Link
            href="/charts"
            className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
          >
            Get started
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="hover:bg-accent flex size-9 items-center justify-center rounded-full md:hidden"
          >
            {open ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {open && (
        <div className="animate-in fade-in slide-in-from-top-2 border-border border-t px-4 pt-2 pb-4 duration-200 md:hidden">
          <ul className="flex flex-col">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="hover:bg-accent block rounded-lg px-3 py-3 font-medium"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/charts"
                className="hover:bg-accent block rounded-lg px-3 py-3 font-medium"
              >
                Sign in
              </Link>
            </li>
          </ul>
          <div className="border-border mt-2 flex items-center justify-between border-t px-3 pt-3">
            <span className="text-muted-foreground text-sm">Theme</span>
            <ModeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
