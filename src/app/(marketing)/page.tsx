import { Bento } from "@/components/sections/bento";
import { Comparison } from "@/components/sections/comparison";
import { Faq } from "@/components/sections/faq";
import { FinalCta } from "@/components/sections/final-cta";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { LiveExample } from "@/components/sections/live-example";
import { ModelMarquee } from "@/components/sections/model-marquee";
import { PricingTable } from "@/components/sections/pricing-table";
import { StatBand } from "@/components/sections/stat-band";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <ModelMarquee />
      <HowItWorks />
      <LiveExample />
      <PricingTable />
      <Bento />
      <Comparison />
      <StatBand />
      <Faq />
      <FinalCta />
    </>
  );
}