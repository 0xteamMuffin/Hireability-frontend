"useclient";
import { Navbar } from "@/components/start/navbar";
import { Hero } from "@/components/start/hero";
import { CTA } from "@/components/start/cta";
import { FeatureCards } from "@/components/start/featurecards";
import { Partners } from "@/components/start/partners";
import { Footer } from "@/components/start/footer";

// --- MAIN APP COMPONENT ---

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar />
      <main>
        <Hero />
        <Partners />
        <FeatureCards />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
