import Link from "next/link";
import type { ReactNode } from "react";
import GlowBackdrop from "@/components/brand/glow-backdrop";
import { Logo } from "@/components/brand/logo";
import ModeToggle from "@/components/utility/mode-toggle";
import { APP_NAME, TAGLINE } from "@/lib/brand";

/** The branded page around Clerk's sign-in and sign-up forms. */
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-paper relative flex h-full flex-col overflow-x-clip overflow-y-auto">
      <GlowBackdrop />

      <header className="relative flex h-16 shrink-0 items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label={`${APP_NAME} home`} className="text-lg">
          <Logo name={APP_NAME} />
        </Link>
        <ModeToggle />
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10">
        <p className="font-display text-muted-foreground max-w-sm text-center text-lg text-balance">
          {TAGLINE}
        </p>
        {children}
        <p className="text-muted-foreground max-w-xs text-center text-xs leading-relaxed">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-foreground underline underline-offset-2">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-foreground underline underline-offset-2">
            Privacy policy
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
