import { Navbar } from '@/components/ui/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { TemplateGallery } from '@/components/landing/TemplateGallery';
import { Pricing } from '@/components/landing/Pricing';
import { Testimonials } from '@/components/landing/Testimonials';
import { FAQ } from '@/components/landing/FAQ';
import { Footer } from '@/components/ui/Footer';

export default function HomePage() {
  return (
    <main className="landing-page">
      <Navbar />
      <Hero />
      <Features />
      <TemplateGallery />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
