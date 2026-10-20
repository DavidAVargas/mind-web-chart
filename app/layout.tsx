import type { Metadata } from "next";
import { inter } from "@/utils/fonts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Mind Web Chart",
  description: "A personal mind map for organizing thoughts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <div className="h-dvh">{children}</div>
      </body>
    </html>
  );
}
