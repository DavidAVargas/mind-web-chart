import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import AdminBadge from "@/components/auth/admin-badge";
import { Logo } from "@/components/brand/logo";
import ModeToggle from "@/components/utility/mode-toggle";
import { APP_NAME } from "@/lib/brand";

export default function Header() {
  return (
    <header className="border-border flex h-12 shrink-0 items-center justify-between border-b px-4">
      {/* The logo leads back to the public home page. The mobile app has no landing page, so it will point at /charts there. */}
      <Link
        href="/"
        aria-label={`${APP_NAME} home page`}
        title="Back to the home page"
        className="-mx-2 rounded-lg px-2 py-1 transition-opacity hover:opacity-75"
      >
        <Logo name={APP_NAME} />
      </Link>

      <div className="flex items-center gap-3">
        <AdminBadge />
        <ModeToggle />
        {/* Keeps its spot while Clerk loads, so the header doesn't jump. */}
        <div className="flex size-7 items-center justify-center">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
