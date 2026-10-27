"use client";

import { useUser } from "@clerk/nextjs";
import { ShieldCheck } from "lucide-react";

/** A small tag next to the profile button, shown only to admin accounts. */
export default function AdminBadge() {
  const { user } = useUser();
  if (user?.publicMetadata.role !== "admin") return null;

  return (
    <span
      title="Signed in as an admin"
      className="flex items-center gap-1 rounded-full bg-[#9e77ed]/15 px-2 py-0.5 text-xs font-semibold text-[#7f56d9] dark:text-[#b692f6]"
    >
      <ShieldCheck className="size-3.5" aria-hidden="true" />
      Admin
    </span>
  );
}
