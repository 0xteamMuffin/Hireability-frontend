'useclient';
import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { CTA } from '@/components/landing/cta';
import { FeatureCards } from '@/components/landing/featurecards';
import { Partners } from '@/components/landing/partners';
import { Footer } from '@/components/landing/footer';

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
