/**
 * Payments run through RevenueCat: Stripe on the website, Apple and Google in
 * the apps. Prices live in those stores, not here. Whatever is bought unlocks
 * this entitlement, which the server copies onto the account as `plan: "pro"`.
 */
export const PRO_ENTITLEMENT = "pro";

/**
 * Prices shown on the website, in US dollars. The stores charge whatever is
 * set in them, so change these whenever the prices there change.
 */
export const LIST_PRICES = { monthly: 3.99, annual: 29.99 };
