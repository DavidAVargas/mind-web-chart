/**
 * Payments run through RevenueCat: Stripe on the website, Apple and Google in
 * the apps. Prices live in those stores, not here. Whatever is bought unlocks
 * this entitlement, which the server copies onto the account as `plan: "pro"`.
 */
export const PRO_ENTITLEMENT = "pro";
