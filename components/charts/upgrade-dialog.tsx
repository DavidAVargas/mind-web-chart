"use client";

import { useUser } from "@clerk/nextjs";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  openStore,
  syncPlan,
  type PlanId,
  type Store,
  type Where,
} from "@/lib/billing/store";
import { APP_NAME } from "@/lib/brand";
import { FREE_CHART_LIMIT } from "@/lib/mind-map/chart-meta";
import { cn } from "@/lib/utils";

const PRO_PERKS = [
  "Unlimited charts",
  "Make each chart’s key your own",
  "On the web, iPhone and Android, with one account",
];

/** What brought the person here: something the free plan doesn't include, or the account menu. */
export type UpgradeReason = "charts" | "key" | "plan";

const COPY: Record<UpgradeReason, { title: string; body: string }> = {
  charts: {
    title: "Your free chart is in use",
    body: `The free plan includes ${FREE_CHART_LIMIT} chart. Go Pro for as many as you like, or keep building on the one you have.`,
  },
  key: {
    title: "Make the key your own",
    body: "Rename types, pick their colors and icons, and add your own with Pro. On the free plan, each template’s key is ready to use as it is.",
  },
  plan: {
    title: `${APP_NAME} Pro`,
    body: "Everything, on every chart.",
  },
};

const PLAN_LABEL: Record<PlanId, { name: string; per: string }> = {
  annual: { name: "Yearly", per: "/year" },
  monthly: { name: "Monthly", per: "/month" },
};

const CANCEL_WHERE: Record<Where, string> = {
  web: "from your account menu",
  ios: "in your App Store settings",
  android: "in Google Play",
};

/**
 * The upgrade screen: why Pro, the plans on sale, and the checkout. Shown when
 * a free account reaches for something Pro includes, or from the account menu.
 */
export default function UpgradeDialog({
  reason,
  onClose,
}: {
  reason: UpgradeReason;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const checkoutRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const userId = user?.id;
  // undefined while loading; null when nothing is on sale yet.
  const [store, setStore] = useState<Store | null | undefined>(undefined);
  const [plan, setPlan] = useState<PlanId>("annual");
  const [busy, setBusy] = useState<"buy" | "restore" | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { title, body } = COPY[reason];

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    if (!userId) return;
    let live = true;
    openStore(userId)
      .then((opened) => {
        if (!live) return;
        setStore(opened);
        if (opened && !opened.plans.some((item) => item.id === "annual")) {
          setPlan(opened.plans[0].id);
        }
      })
      .catch((reason) => {
        console.error("Couldn't load plans", reason);
        if (live) setStore(null);
      });
    return () => {
      live = false;
    };
  }, [userId]);

  /** After a purchase or restore: switch Pro on for this account. */
  async function unlock() {
    try {
      const pro = await syncPlan();
      await user?.reload();
      if (pro) {
        onClose();
        toast.success("Welcome to Pro! Everything’s unlocked.");
      } else {
        setError("No active subscription was found for this account.");
      }
    } catch (reason) {
      console.error(reason);
      setError(
        "Your purchase went through, but Pro hasn’t switched on yet. It should within a minute. Try reloading then.",
      );
    }
  }

  async function buy() {
    if (!store) return;
    setBusy("buy");
    setError(null);
    // The website's checkout fills the screen, inside this dialog so it shows on top.
    if (store.where === "web") setCheckoutOpen(true);
    try {
      const result = await store.buy(plan, checkoutRef.current ?? undefined);
      setCheckoutOpen(false);
      if (result === "bought") await unlock();
    } catch (reason) {
      console.error(reason);
      setError("Something went wrong with the purchase. Please try again.");
    } finally {
      setCheckoutOpen(false);
      setBusy(null);
    }
  }

  async function restore() {
    if (!store?.restore) return;
    setBusy("restore");
    setError(null);
    try {
      await store.restore();
      await unlock();
    } catch (reason) {
      console.error(reason);
      setError("Couldn’t restore purchases. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // No closing halfway through a purchase.
      onCancel={(event) => busy && event.preventDefault()}
      onClick={(event) =>
        event.target === dialogRef.current && !busy && onClose()
      }
      aria-labelledby="upgrade-dialog-title"
      className="bg-card text-card-foreground border-border m-auto max-h-[calc(100dvh-2rem)] w-[min(26rem,calc(100%-2rem))] overflow-y-auto rounded-2xl border p-0 shadow-2xl backdrop:bg-black/50"
    >
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <span className="flex size-11 items-center justify-center rounded-full bg-[#9e77ed]/15 text-[#7f56d9] dark:text-[#b692f6]">
            <Sparkles className="size-5" aria-hidden="true" />
          </span>
          <button
            type="button"
            onClick={onClose}
            disabled={busy !== null}
            aria-label="Close"
            className="hover:bg-accent rounded-full p-1 disabled:opacity-30"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div>
          <h2
            id="upgrade-dialog-title"
            className="font-display text-2xl font-medium tracking-tight"
          >
            {title}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {body}
          </p>
        </div>

        <ul className="flex flex-col gap-2 text-sm">
          {PRO_PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-2">
              <Check
                className="size-4 shrink-0 text-emerald-500"
                strokeWidth={3}
                aria-hidden="true"
              />
              {perk}
            </li>
          ))}
        </ul>

        {store === undefined && (
          <div className="flex flex-col gap-2" aria-label="Loading plans">
            {[0, 1].map((item) => (
              <div
                key={item}
                className="bg-muted h-16 animate-pulse rounded-xl"
              />
            ))}
          </div>
        )}

        {store === null && (
          <>
            <p className="bg-muted text-muted-foreground rounded-xl px-4 py-3 text-sm">
              Upgrades aren’t open just yet. Check back soon.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="bg-primary text-primary-foreground rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              Got it
            </button>
          </>
        )}

        {store && (
          <>
            <div
              role="radiogroup"
              aria-label="Plan"
              className="flex flex-col gap-2"
            >
              {store.plans.map(({ id, price }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={plan === id}
                  onClick={() => setPlan(id)}
                  disabled={busy !== null}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors",
                    plan === id
                      ? "border-brand-500 bg-brand-500/5"
                      : "border-border hover:bg-accent",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                      plan === id ? "border-brand-500" : "border-border",
                    )}
                  >
                    {plan === id && (
                      <span className="bg-brand-500 size-2.5 rounded-full" />
                    )}
                  </span>
                  <span className="flex-1 font-medium">
                    {PLAN_LABEL[id].name}
                    {id === "annual" && store.plans.length > 1 && (
                      <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        Best value
                      </span>
                    )}
                  </span>
                  <span className="text-sm">
                    <span className="font-semibold">{price}</span>
                    <span className="text-muted-foreground">
                      {PLAN_LABEL[id].per}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {error && (
              <p role="alert" className="text-destructive text-sm">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={buy}
                disabled={busy !== null}
                className="bg-primary text-primary-foreground flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
              >
                {busy === "buy" && (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                )}
                Go Pro
              </button>
              {store.restore && (
                <button
                  type="button"
                  onClick={restore}
                  disabled={busy !== null}
                  className="text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 py-1 text-sm disabled:opacity-60"
                >
                  {busy === "restore" && (
                    <Loader2
                      className="size-3.5 animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  Restore purchases
                </button>
              )}
            </div>

            {/* What the stores ask to be shown next to a subscription. */}
            <p className="text-muted-foreground text-center text-xs leading-relaxed">
              Renews automatically until you cancel. Cancel anytime{" "}
              {CANCEL_WHERE[store.where]}. See our{" "}
              <Link href="/terms" target="_blank" className="underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className="underline">
                Privacy Policy
              </Link>
              .
            </p>
          </>
        )}
      </div>

      {/* The website's checkout renders here, over the whole screen. */}
      <div
        ref={checkoutRef}
        className={cn(
          "bg-background fixed inset-0 z-10 overflow-y-auto",
          !checkoutOpen && "hidden",
        )}
      />
    </dialog>
  );
}
