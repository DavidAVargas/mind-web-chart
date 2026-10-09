import type { Metadata } from "next";
import { inter } from "@/utils/fonts";
import "@/styles/globals.css";
import Header from "@/components/_blocks/header/header";

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
        <div className="grid h-dvh grid-rows-[auto_1fr]">
          <Header />
          <main className="min-h-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
