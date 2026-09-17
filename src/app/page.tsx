import { SiteHeader } from '@/components/public/SiteHeader';
import { Hero } from '@/components/public/Hero';
import { ShowcaseSection } from '@/components/public/ShowcaseSection';
import { PricesSection } from '@/components/public/PricesSection';
import { InfoSection } from '@/components/public/InfoSection';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MobileDock } from '@/components/public/MobileDock';
import { getActiveServices } from '@/lib/data';

export default async function HomePage() {
  const services = await getActiveServices();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <ShowcaseSection />
        <PricesSection services={services} />
        <InfoSection />
      </main>
      <SiteFooter />
      <MobileDock />
    </>
  );
}
