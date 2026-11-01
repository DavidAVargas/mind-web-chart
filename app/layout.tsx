import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata, Viewport } from "next";
import { fraunces, inter } from "@/utils/fonts";
import "@/styles/globals.css";
import { APP_NAME, SITE_URL, TAGLINE } from "@/lib/brand";
import NativeShell from "@/components/native/native-shell";

export const metadata: Metadata = {
  title: { template: `%s · ${APP_NAME}`, default: APP_NAME },
  description: TAGLINE,
  applicationName: APP_NAME,
  // Lets link previews use full URLs for the share image.
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_NAME,
    description: TAGLINE,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: TAGLINE,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Stops iPhones zooming the page in when a text box is tapped. Pinch zoom
  // still works, and the chart has its own zoom.
  maximumScale: 1,
  // Lets pages reach under the phone's clock, camera and home bar; the wrapper
  // below pads them back out (see `SAFE_AREA`).
  viewportFit: "cover",
};

// Keeps buttons clear of the clock, camera and home bar, which on some phones
// (like a foldable opened up) sit along a side edge. Zero on a computer.
const SAFE_AREA =
  "pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]";

// Sets light/dark before the page paints, so there's no flash of the wrong theme.
const themeScript = `(() => {
  try {
    const mode = localStorage.getItem("theme");
    const dark = mode === "dark" || (mode !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.add(dark ? "dark" : "light");
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  } catch {}
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The theme script changes <html> before React loads, which is expected.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} ${fraunces.variable}`}>
        <ClerkProvider
          appearance={{ theme: shadcn }}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/charts"
          signUpFallbackRedirectUrl="/charts"
          afterSignOutUrl="/"
        >
          <div className={`h-dvh ${SAFE_AREA}`}>{children}</div>
          <NativeShell />
        </ClerkProvider>
      </body>
    </html>
  );
}
