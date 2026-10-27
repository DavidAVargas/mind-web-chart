import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";

export default function ClosingCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="reveal bg-foreground text-background relative overflow-hidden rounded-[2.5rem] px-6 py-16 text-center sm:px-12 sm:py-20">
        {/* The same color glows, glowing out of the dark panel. */}
        <div
          aria-hidden="true"
          className="animate-glow pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(30rem 16rem at 15% 100%, color-mix(in oklch, #9e77ed 55%, transparent), transparent 70%), radial-gradient(26rem 14rem at 85% 0%, color-mix(in oklch, #0ea5e9 45%, transparent), transparent 70%), radial-gradient(20rem 12rem at 60% 110%, color-mix(in oklch, #10b981 40%, transparent), transparent 70%)",
          }}
        />
        <div className="relative">
          <LogoMark className="mx-auto size-12" />
          <h2 className="font-display mx-auto mt-6 max-w-2xl text-4xl font-medium tracking-tight text-balance sm:text-6xl">
            Your mind, untangled.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg opacity-70">
            Start with one thought. See where it leads.
          </p>
          <Link
            href="/sign-up"
            className="group bg-background text-foreground mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold shadow-xl transition-transform hover:-translate-y-0.5"
          >
            Start for free
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
