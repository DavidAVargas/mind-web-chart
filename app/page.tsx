import GlowBackdrop from "@/components/brand/glow-backdrop";
import ClosingCta from "@/components/landing/closing-cta";
import Features from "@/components/landing/features";
import Hero from "@/components/landing/hero";
import HowItWorks from "@/components/landing/how-it-works";
import LandingFooter from "@/components/landing/landing-footer";
import LandingNav from "@/components/landing/landing-nav";
import Pricing from "@/components/landing/pricing";

/** The public home page. Signed-in people (and the app) go to /charts. */
export default function LandingPage() {
  return (
    <div className="bg-paper relative h-full overflow-x-clip overflow-y-auto scroll-smooth">
      <GlowBackdrop />
      <div className="relative">
        <LandingNav />
        <main>
          <Hero />
          <HowItWorks />
          <Features />
          <Pricing />
          <ClosingCta />
        </main>
        <LandingFooter />
      </div>
    </div>
  );
}
