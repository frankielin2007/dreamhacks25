import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import Hero from "@/components/marketing/Hero";
import ValueGrid from "@/components/marketing/ValueGrid";
import MetricsRow from "@/components/marketing/MetricsRow";
import Steps from "@/components/marketing/Steps";
import Testimonial from "@/components/marketing/Testimonial";

export default function MarketingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      
      <main className="flex-1">
        <Hero />
        <ValueGrid />
        <MetricsRow />
        <Steps />
        <Testimonial />
      </main>
      
      <SiteFooter />
    </div>
  );
}
