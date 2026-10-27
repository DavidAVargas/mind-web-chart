import type { ReactNode } from "react";
import GlowBackdrop from "@/components/brand/glow-backdrop";
import LandingFooter from "@/components/landing/landing-footer";
import LandingNav from "@/components/landing/landing-nav";

/** A readable, single-column page for the privacy policy and terms. */
export default function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  /** e.g. "October 27, 2026" */
  updated: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="bg-paper relative h-full overflow-x-clip overflow-y-auto scroll-smooth">
      <GlowBackdrop />
      <div className="relative">
        <LandingNav />
        <main className="mx-auto max-w-3xl px-4 pt-14 pb-20 sm:px-6 sm:pt-20">
          <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
            Last updated {updated}
          </p>
          <h1 className="font-display mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
            {title}
          </h1>
          <div className="text-muted-foreground mt-5 text-lg leading-relaxed text-pretty">
            {intro}
          </div>
          <article className="prose prose-neutral dark:prose-invert border-border bg-card/80 prose-headings:font-display prose-headings:font-medium prose-headings:tracking-tight prose-h2:mt-10 prose-h2:text-2xl prose-a:text-foreground mt-10 max-w-none rounded-3xl border p-6 shadow-sm backdrop-blur sm:p-10 [&>h2:first-child]:mt-0">
            {children}
          </article>
        </main>
        <LandingFooter />
      </div>
    </div>
  );
}
