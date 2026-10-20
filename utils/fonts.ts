import localFont from "next/font/local";
import { Fraunces } from "next/font/google";

export const inter = localFont({
  src: "../public/fonts/InterVariable.woff2",
  variable: "--font-inter",
  weight: "300 400 500 600 700",
});

/** Soft, characterful serif for headings. */
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "opsz"],
});
