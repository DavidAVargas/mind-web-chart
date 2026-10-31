"use client";

import { useUser } from "@clerk/nextjs";
import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePlan } from "@/components/auth/use-plan";
import UpgradeDialog from "@/components/charts/upgrade-dialog";
import { LIST_PRICES } from "@/lib/billing/plans";
import { FREE_CHART_LIMIT } from "@/lib/mind-map/chart-meta";
import { cn } from "@/lib/utils";

const FREE_PERKS = [
  `${FREE_CHART_LIMIT} chart`,
  "Every template, with its ready-made key",
  "Bubble types, threads, notes and to-dos",
  "On the web, iPhone and Android",
];

const PRO_PERKS = [
  "Unlimited charts",
  "Make each chart’s key your own: rename types, pick colors and icons, add new ones",
  "Everything in Free",
];

const SAVING = Math.round(
  (1 - LIST_PRICES.annual / (LIST_PRICES.monthly * 12)) * 100,
);

function Perks({ perks }: { perks: string[] }) {
  return (
    <ul className="flex flex-col gap-3 text-sm">
      {perks.map((perk) => (
        <li key={perk} className="flex gap-2.5">
          <Check
            className="mt-0.5 size-4 shrink-0 text-emerald-500"
            strokeWidth={3}
            aria-hidden="true"
          />
          {perk}
        </li>
      ))}
    </ul>
  );
}

const CTA_CLASS =
  "bg-primary text-primary-foreground mt-8 rounded-full px-5 py-3 text-center text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md";

/** Plans and prices. Hidden from people who already have Pro. */
export default function Pricing() {
  const { isSignedIn } = useUser();
  const { isPro } = usePlan();
  const [yearly, setYearly] = useState(true);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const price = yearly ? LIST_PRICES.annual : LIST_PRICES.monthly;

  if (isPro) return null;

  return (
    <section
      id="pricing"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6"
    >
      <div className="reveal mx-auto max-w-2xl text-center">
        <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
          Pricing
        </p>
        <h2 className="font-display mt-3 text-4xl font-medium tracking-tight text-balance sm:text-5xl">
          Start free. Go Pro when one chart isn’t enough.
        </h2>
      </div>

      <div
        role="radiogroup"
        aria-label="Billing"
        className="reveal border-border bg-card/80 mx-auto mt-10 flex w-fit gap-1 rounded-full border p-1 shadow-sm"
      >
        {[
          { value: false, label: "Monthly" },
          { value: true, label: "Yearly" },
        ].map(({ value, label }) => (
          <button
            key={label}
            type="button"
            role="radio"
            aria-checked={yearly === value}
            onClick={() => setYearly(value)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              yearly === value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
            {value && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs font-semibold",
                  yearly
                    ? "bg-emerald-400/25 text-emerald-300 dark:text-emerald-700"
                    : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
                )}
              >
                Save {SAVING}%
              </span>
            )}
          </button>
        ))}
      </div>

      <ul className="mx-auto mt-8 grid max-w-3xl gap-5 md:grid-cols-2">
        <li className="reveal border-border bg-card/80 flex flex-col rounded-3xl border p-7 shadow-sm backdrop-blur">
          <h3 className="text-lg font-semibold">Free</h3>
          <p className="mt-4 flex items-baseline gap-1">
            <span className="font-display text-5xl font-medium tracking-tight">
              $0
            </span>
            <span className="text-muted-foreground text-sm">forever</span>
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            Everything you need to map one part of your life.
          </p>
          <div className="mt-6 flex-1">
            <Perks perks={FREE_PERKS} />
          </div>
          <Link
            href={isSignedIn ? "/charts" : "/sign-up"}
            className="border-border hover:bg-accent mt-8 rounded-full border px-5 py-3 text-center text-sm font-semibold transition-colors"
          >
            {isSignedIn ? "Open your charts" : "Start for free"}
          </Link>
        </li>

        <li className="reveal border-brand-500 bg-card relative flex flex-col rounded-3xl border-2 p-7 shadow-xl">
          <span className="bg-brand-500 absolute -top-3 left-7 rounded-full px-3 py-0.5 text-xs font-semibold text-white">
            Pro
          </span>
          <h3 className="text-lg font-semibold">Pro</h3>
          <p className="mt-4 flex items-baseline gap-1">
            <span className="font-display text-5xl font-medium tracking-tight">
              ${price}
            </span>
            <span className="text-muted-foreground text-sm">
              {yearly ? "/year" : "/month"}
            </span>
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            {yearly
              ? `That’s $${(LIST_PRICES.annual / 12).toFixed(2)} a month, billed yearly.`
              : "Billed monthly. Cancel anytime."}
          </p>
          <div className="mt-6 flex-1">
            <Perks perks={PRO_PERKS} />
          </div>
          {isSignedIn ? (
            <button
              type="button"
              onClick={() => setUpgradeOpen(true)}
              className={CTA_CLASS}
            >
              Go Pro
            </button>
          ) : (
            <Link href="/sign-up" className={CTA_CLASS}>
              Start free, upgrade anytime
            </Link>
          )}
        </li>
      </ul>

      <p className="text-muted-foreground mx-auto mt-6 max-w-md text-center text-xs leading-relaxed">
        Prices in US dollars. In the iPhone and Android apps, the App Store and
        Google Play show the price in your currency.
      </p>

      {upgradeOpen && (
        <UpgradeDialog reason="plan" onClose={() => setUpgradeOpen(false)} />
      )}
    </section>
  );
}
