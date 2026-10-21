import GlowBackdrop from "@/components/brand/glow-backdrop";
import Hero from "@/components/landing/hero";
import LandingNav from "@/components/landing/landing-nav";

/** The public home page. Signed-in people (and the app) go to /charts. */
export default function LandingPage() {
  return (
    <div className="bg-paper relative h-full overflow-y-auto">
      <GlowBackdrop />
      <div className="relative">
        <LandingNav />
        <main>
          <Hero />
        </main>
      </div>
    </div>
  );
}
