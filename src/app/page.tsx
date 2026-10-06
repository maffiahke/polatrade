import { Navbar } from "@/components/Navbar";
import { TickerMarquee } from "@/components/TickerMarquee";
import { LiveChartPreview } from "@/components/LiveChartPreview";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Steps } from "@/components/landing/Steps";
import { Stats } from "@/components/landing/Stats";
import { Reviews } from "@/components/landing/Reviews";
import { Cta } from "@/components/landing/Cta";

import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="bg-mesh bg-noise vignette text-white min-h-screen-safe overflow-x-hidden transition-colors duration-300 relative">
      {/* Floating glow orbs */}
      <div className="orb orb-purple w-[600px] h-[600px] top-[-200px] left-[20%]" />
      <div className="orb orb-green w-[500px] h-[500px] top-[40%] right-[-100px]" />
      <div className="orb orb-blue w-[400px] h-[400px] bottom-[-100px] left-[-80px]" />

      <div className="relative z-10">
        <Navbar />
        <Hero />
        <TickerMarquee />
        <LiveChartPreview />
        <Features />
        <Steps />
        <Stats />
        <Reviews />
        <Cta />
        <Footer />
      </div>
    </div>
  );
}
