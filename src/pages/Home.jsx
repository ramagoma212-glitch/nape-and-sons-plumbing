import Seo from '../components/Seo'
import Hero from '../sections/Hero'
import TrustStrip from '../sections/TrustStrip'
import ServicesSection from '../sections/ServicesSection'
import WhyChooseUs from '../sections/WhyChooseUs'
import EmergencySection from '../sections/EmergencySection'
import FeaturedProjects from '../sections/FeaturedProjects'
import BackupWaterSection from '../sections/BackupWaterSection'
import ServiceAreas from '../sections/ServiceAreas'
import ExpectationsSection from '../sections/ExpectationsSection'
import CTASection from '../components/CTASection'

export default function Home() {
  return (
    <>
      <Seo
        title="Nape and Sons Plumbing & Projects | Plumber Limpopo, Pretoria & Johannesburg"
        description="Reliable plumbing services in Polokwane and surrounding areas in Limpopo, Pretoria and Johannesburg. Blocked drains, leak detection, geyser and solar geyser installations, pipe repairs and water tank systems."
        path="/"
      />
      <Hero />
      <TrustStrip />
      <ServicesSection />
      <WhyChooseUs />
      <EmergencySection />
      <FeaturedProjects />
      <BackupWaterSection />
      <ServiceAreas />
      <ExpectationsSection />
      <CTASection
        eyebrow="Get In Touch"
        title="Need a Plumber? Let's Talk."
        description="Tell us what you need and our team will get back to you regarding your plumbing project."
      />
    </>
  )
}
