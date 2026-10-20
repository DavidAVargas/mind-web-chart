import type { Metadata } from "next";
import { fraunces, inter } from "@/utils/fonts";
import "@/styles/globals.css";
import { APP_NAME, TAGLINE } from "@/lib/brand";

export const metadata: Metadata = {
  title: { template: `%s · ${APP_NAME}`, default: APP_NAME },
  description: TAGLINE,
  applicationName: APP_NAME,
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
        <div className="h-dvh">{children}</div>
      </body>
    </html>
  );
}
