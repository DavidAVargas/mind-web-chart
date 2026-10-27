import { ArrowRight, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import HeroWeb from "./hero-web";

export default function Hero() {
  return (
    <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-12 pb-20 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pt-24">
      <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700 motion-reduce:animate-none">
        <p className="border-border bg-card/70 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur">
          <Sparkles className="size-3.5 text-[#9e77ed]" aria-hidden="true" />A
          calmer way to think things through
        </p>

        <h1 className="font-display mt-6 text-5xl leading-[1.02] font-medium tracking-tight text-balance sm:text-6xl lg:text-7xl">
          Untangle what&apos;s on your&nbsp;
          <span className="relative whitespace-nowrap">
            mind.
            {/* A hand-drawn thread under the last word. */}
            <svg
              viewBox="0 0 200 20"
              preserveAspectRatio="none"
              className="absolute -bottom-2 left-0 h-3 w-full text-[#10b981]"
              aria-hidden="true"
            >
              <path
                d="M2 14 Q 60 2 110 10 T 198 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed text-pretty">
          Spin your thoughts into a web you can see: goals, blockers, root
          causes and next steps, all connected. Then follow the threads to what
          really matters.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/sign-up"
            className="group bg-primary text-primary-foreground inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl"
          >
            Start for free
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
          <a
            href="#how-it-works"
            className="border-border bg-card/70 hover:bg-accent inline-flex items-center justify-center rounded-full border px-6 py-3 text-base font-semibold backdrop-blur transition-colors"
          >
            See how it works
          </a>
        </div>

        <p className="text-muted-foreground mt-6 flex items-center gap-2 text-sm">
          <Lock className="size-3.5" aria-hidden="true" />
          Start free with one chart. Your charts are private to your account.
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
        <div className="border-border bg-card/60 bg-paper relative rounded-[2rem] border p-4 shadow-2xl backdrop-blur-sm sm:p-6">
          <HeroWeb />
        </div>
      </div>
    </section>
  );
}
