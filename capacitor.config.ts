import type { CapacitorConfig } from "@capacitor/cli";
import { APP_NAME, SITE_URL } from "./lib/brand";

/**
 * The phone apps. Charts are saved on the server and accounts go through
 * Clerk, so the app loads the live site rather than a copy of it. `mobile/`
 * holds the few pages that ship inside the app itself, like the offline one.
 */
const config: CapacitorConfig = {
  // The app's permanent id in the App Store and Google Play. It can still
  // change now, but not once the app is published, so settle the name first.
  appId: "app.thoughtspun",
  appName: APP_NAME,
  webDir: "mobile",
  server: {
    url: `${SITE_URL}/charts`,
    // Shown when the site can't be reached, e.g. with no signal.
    errorPath: "offline.html",
    // Anything not listed here opens in the phone's browser instead of the app.
    // The iPhone app only counts addresses starting with `url` above as its
    // own, so the rest of the site (like /sign-in) has to be listed too. Clerk
    // checks the sign-in on its own address before the site loads; add the
    // production Clerk address (clerk.<domain>) once it exists.
    allowNavigation: [new URL(SITE_URL).host, "*.clerk.accounts.dev"],
  },
  plugins: {
    SplashScreen: {
      // The site hides it as soon as it loads (components/native/native-shell.tsx).
      // This is the most it stays, e.g. when offline and the site never loads.
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
    },
  },
};

export default config;
