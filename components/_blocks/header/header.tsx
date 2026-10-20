import ModeToggle from "@/components/utility/mode-toggle";
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-border flex h-12 shrink-0 items-center justify-between border-b px-4">
      <Link href="/" className="font-semibold">
        Mind Web Chart
      </Link>

      <div>
        <ModeToggle />
      </div>
    </header>
  );
}
