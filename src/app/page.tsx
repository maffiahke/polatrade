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
    <div className="bg-gradient-to-b from-[#070b17] via-[#0b1428] to-[#0f1b3d] text-white min-h-screen-safe overflow-x-hidden transition-colors duration-300">
      <Navbar />
      <Hero />
      <TickerMarquee />
      <LiveChartPreview />
      <Features />
      <Steps />
      <Stats />
      <Reviews />
      <Cta />
<script type="text/javascript">
var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/6a021d241ef7281c3424b12f/1joc43ne4';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();
</script>
      <Footer />
    </div>
  );
}
