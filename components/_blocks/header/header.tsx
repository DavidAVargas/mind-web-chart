import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import AdminBadge from "@/components/auth/admin-badge";
import { Logo } from "@/components/brand/logo";
import ModeToggle from "@/components/utility/mode-toggle";
import { APP_NAME } from "@/lib/brand";

export default function Header() {
  return (
    <header className="border-border flex h-12 shrink-0 items-center justify-between border-b px-4">
      <Link href="/charts" aria-label={`${APP_NAME} home`}>
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
