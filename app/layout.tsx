import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import { fraunces, inter } from "@/utils/fonts";
import "@/styles/globals.css";
import { APP_NAME, SITE_URL, TAGLINE } from "@/lib/brand";

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
          <div className="h-dvh">{children}</div>
        </ClerkProvider>
      </body>
    </html>
  );
}
