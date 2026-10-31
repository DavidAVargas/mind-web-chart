"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { CreditCard, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import UpgradeDialog from "@/components/charts/upgrade-dialog";
import { openStore, where } from "@/lib/billing/store";
import { usePlan } from "./use-plan";

/**
 * The account menu, with the plan in it: "Go Pro" on the free plan, and
 * "Manage subscription" for Pro, which opens wherever it was bought.
 */
export default function AccountButton() {
  const { user } = useUser();
  const { isAdmin, isPro } = usePlan();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  async function manage() {
    try {
      const store = user && (await openStore(user.id));
      const url = await store?.manageUrl();
      if (!url) throw new Error("No subscription settings to open");
      // The apps hand store links to the phone; the website opens a new tab.
      if (where() === "web") window.open(url, "_blank", "noopener");
      else window.location.href = url;
    } catch (reason) {
      console.error(reason);
      toast.error(
        "Couldn’t open your subscription settings. Please try again.",
      );
    }
  }

  // Admins have everything already, so there's no plan to show.
  if (isAdmin) return <UserButton />;

  return (
    <>
      {isPro ? (
        <UserButton>
          <UserButton.MenuItems>
            <UserButton.Action
              label="Manage subscription"
              labelIcon={<CreditCard className="size-4" />}
              onClick={manage}
            />
          </UserButton.MenuItems>
        </UserButton>
      ) : (
        <UserButton>
          <UserButton.MenuItems>
            <UserButton.Action
              label="Go Pro"
              labelIcon={<Sparkles className="size-4" />}
              onClick={() => setUpgradeOpen(true)}
            />
          </UserButton.MenuItems>
        </UserButton>
      )}
      {upgradeOpen && (
        <UpgradeDialog reason="plan" onClose={() => setUpgradeOpen(false)} />
      )}
    </>
  );
}
