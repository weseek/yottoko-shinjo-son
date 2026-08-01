import { AboutSection } from "@/app/_components/landing/about-section";
import { BackgroundSection } from "@/app/_components/landing/background-section";
import { FeatureActivitySection } from "@/app/_components/landing/feature-activity-section";
import { FeatureArSection } from "@/app/_components/landing/feature-ar-section";
import { HeroSection } from "@/app/_components/landing/hero-section";
import { LandingFooter } from "@/app/_components/landing/landing-footer";
import { LandingHeader } from "@/app/_components/landing/landing-header";

export default function Home() {
  return (
    <>
      <LandingHeader />
      <main className="overflow-x-hidden">
        <HeroSection />
        <AboutSection />
        <FeatureActivitySection />
        <FeatureArSection />
        <BackgroundSection />
        <LandingFooter />
      </main>
    </>
  );
}
