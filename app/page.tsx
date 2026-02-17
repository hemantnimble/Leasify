// 

// app/page.tsx  (temporary test)
import { CtaSection } from "@/components/home/CtaSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { FinalCtaSection } from "@/components/home/Finalctasection";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeFooter } from "@/components/home/Homefooter";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { PropertiesSection } from "@/components/home/PropertiesSection";
import { ScrollBasedVelocity } from "@/components/home/ScrollBasedVelocity";
import { StatsSection } from "@/components/home/StatsSection";

export default function HomePage() {
  return (
    <div >
      <HeroSection />
      <ScrollBasedVelocity />
      <PropertiesSection/>
      <HowItWorksSection/>
      <StatsSection/>
      <FeaturesSection/>
      <CtaSection/>
      <FinalCtaSection/>
      <HomeFooter/>
    </div>
  );
}