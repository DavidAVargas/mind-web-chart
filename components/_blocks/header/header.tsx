import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import ModeToggle from "@/components/utility/mode-toggle";
import { APP_NAME } from "@/lib/brand";

export default function Header() {
  return (
    <header className="border-border flex h-12 shrink-0 items-center justify-between border-b px-4">
      <Link href="/charts" aria-label={`${APP_NAME} home`}>
        <Logo name={APP_NAME} />
      </Link>

      <ModeToggle />
    </header>
  );
}
