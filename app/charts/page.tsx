import type { Metadata } from "next";
import Header from "@/components/_blocks/header/header";
import ChartsHome from "@/components/charts/charts-home-client";

export const metadata: Metadata = {
  title: "Your charts",
};

export default function ChartsPage() {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <ChartsHome />
      </main>
    </div>
  );
}
