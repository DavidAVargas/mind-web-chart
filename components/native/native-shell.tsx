"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

/**
 * Glue for the phone apps, which load this site (see capacitor.config.ts).
 * In a normal browser it does nothing.
 */
export default function NativeShell() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let cleanup = () => {};

    (async () => {
      const [{ SplashScreen }, { StatusBar, Style }, { App }] =
        await Promise.all([
          import("@capacitor/splash-screen"),
          import("@capacitor/status-bar"),
          import("@capacitor/app"),
        ]);

      // The page has loaded, so the splash screen can go.
      await SplashScreen.hide();

      // Status bar text follows light/dark mode, so it's readable on both.
      const root = document.documentElement;
      const syncStatusBar = () =>
        StatusBar.setStyle({
          style: root.classList.contains("dark") ? Style.Dark : Style.Light,
        });
      syncStatusBar();
      const observer = new MutationObserver(syncStatusBar);
      observer.observe(root, { attributes: true, attributeFilter: ["class"] });

      // Android's back button goes back a page, and leaves the app from the first one.
      const back = await App.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) window.history.back();
        else App.exitApp();
      });

      cleanup = () => {
        observer.disconnect();
        back.remove();
      };
    })();

    return () => cleanup();
  }, []);

  return null;
}
