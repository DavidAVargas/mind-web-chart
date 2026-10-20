import Header from "@/components/_blocks/header/header";
import ChartsHome from "@/components/charts/charts-home-client";

export default function Home() {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <ChartsHome />
      </main>
    </div>
  );
}
