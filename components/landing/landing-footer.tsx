import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { APP_NAME, TAGLINE } from "@/lib/brand";

export default function LandingFooter() {
  return (
    <footer className="border-border border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="max-w-xs">
          <Logo name={APP_NAME} />
          <p className="text-muted-foreground mt-3 text-sm">{TAGLINE}</p>
        </div>
        <nav aria-label="Footer" className="flex gap-12 text-sm">
          <ul className="flex flex-col gap-2">
            <li className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
              Product
            </li>
            <li>
              <a href="#how-it-works" className="hover:underline">
                How it works
              </a>
            </li>
            <li>
              <a href="#features" className="hover:underline">
                Features
              </a>
            </li>
            <li>
              <Link href="/charts" className="hover:underline">
                Your charts
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-border text-muted-foreground mx-auto max-w-6xl border-t px-4 py-6 text-xs sm:px-6">
        © {new Date().getFullYear()} {APP_NAME}. Made for clearer thinking.
      </div>
    </footer>
  );
}
