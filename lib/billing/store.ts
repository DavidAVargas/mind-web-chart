import { Capacitor } from "@capacitor/core";

/**
 * Buying Pro, wherever the app runs: RevenueCat's Web Billing (Stripe) on the
 * website, and Apple's or Google's own checkout in the phone apps, which the
 * stores require. Every purchase is tied to the Clerk user id, so Pro follows
 * the account across devices.
 */

export type PlanId = "monthly" | "annual";
export type Plan = { id: PlanId; price: string };
export type Where = "web" | "ios" | "android";
export type BuyResult = "bought" | "cancelled";

export type Store = {
  where: Where;
  plans: Plan[];
  /** On the website, `target` is where the checkout appears. */
  buy: (plan: PlanId, target?: HTMLElement) => Promise<BuyResult>;
  /** App stores only: brings back a subscription bought on another phone. */
  restore?: () => Promise<void>;
  /** Where to change or cancel the subscription, once there is one. */
  manageUrl: () => Promise<string | null>;
};

export function where(): Where {
  const platform = Capacitor.getPlatform();
  return platform === "ios" || platform === "android" ? platform : "web";
}

/** Each place has its own public RevenueCat key (written out so Next can inline them). */
function apiKey(place: Where) {
  if (place === "ios") return process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY;
  if (place === "android")
    return process.env.NEXT_PUBLIC_REVENUECAT_ANDROID_KEY;
  return process.env.NEXT_PUBLIC_REVENUECAT_WEB_KEY;
}

/**
 * Connects to the store for this account and loads the plans on sale. Null
 * when nothing's on sale yet: no key set, or no plans set up in RevenueCat.
 */
export async function openStore(userId: string): Promise<Store | null> {
  const place = where();
  const key = apiKey(place);
  if (!key) return null;
  return place === "web"
    ? openWebStore(key, userId)
    : openAppStore(key, userId, place);
}

async function openWebStore(
  key: string,
  userId: string,
): Promise<Store | null> {
  const { Purchases, PurchasesError, ErrorCode } =
    await import("@revenuecat/purchases-js");
  const purchases = Purchases.isConfigured()
    ? Purchases.getSharedInstance()
    : Purchases.configure({ apiKey: key, appUserId: userId });
  if (purchases.getAppUserId() !== userId) await purchases.changeUser(userId);

  const offering = (await purchases.getOfferings()).current;
  const packages = { monthly: offering?.monthly, annual: offering?.annual };
  const plans = (["annual", "monthly"] as const).flatMap((id) => {
    const rcPackage = packages[id];
    return rcPackage
      ? [{ id, price: rcPackage.webBillingProduct.currentPrice.formattedPrice }]
      : [];
  });
  if (!plans.length) return null;

  return {
    where: "web",
    plans,
    async buy(plan, target) {
      const rcPackage = packages[plan];
      if (!rcPackage) throw new Error(`No ${plan} plan on sale`);
      try {
        await purchases.purchase({ rcPackage, htmlTarget: target });
        return "bought";
      } catch (error) {
        if (
          error instanceof PurchasesError &&
          error.errorCode === ErrorCode.UserCancelledError
        ) {
          return "cancelled";
        }
        throw error;
      }
    },
    manageUrl: async () => (await purchases.getCustomerInfo()).managementURL,
  };
}

async function openAppStore(
  key: string,
  userId: string,
  place: "ios" | "android",
): Promise<Store | null> {
  const { Purchases, PURCHASES_ERROR_CODE } =
    await import("@revenuecat/purchases-capacitor");
  const { isConfigured } = await Purchases.isConfigured();
  if (isConfigured) await Purchases.logIn({ appUserID: userId });
  else await Purchases.configure({ apiKey: key, appUserID: userId });

  const offering = (await Purchases.getOfferings()).current;
  const packages = { monthly: offering?.monthly, annual: offering?.annual };
  const plans = (["annual", "monthly"] as const).flatMap((id) => {
    const aPackage = packages[id];
    return aPackage ? [{ id, price: aPackage.product.priceString }] : [];
  });
  if (!plans.length) return null;

  return {
    where: place,
    plans,
    async buy(plan) {
      const aPackage = packages[plan];
      if (!aPackage) throw new Error(`No ${plan} plan on sale`);
      try {
        await Purchases.purchasePackage({ aPackage });
        return "bought";
      } catch (error) {
        const { code, userCancelled } = (error ?? {}) as {
          code?: unknown;
          userCancelled?: boolean | null;
        };
        if (
          userCancelled ||
          code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
        ) {
          return "cancelled";
        }
        throw error;
      }
    },
    async restore() {
      await Purchases.restorePurchases();
    },
    manageUrl: async () =>
      (await Purchases.getCustomerInfo()).customerInfo.managementURL,
  };
}

/** Asks the server to switch Pro on from what RevenueCat now says. */
export async function syncPlan(): Promise<boolean> {
  const response = await fetch("/api/billing/sync", { method: "POST" });
  if (!response.ok) throw new Error(`Plan sync failed (${response.status})`);
  return (await response.json()).pro;
}
