import Hero from '@/components/home/Hero'
import SubBanners from '@/components/home/SubBanners'
import PromotionalBanners from '@/components/home/PromotionalBanners'
import NewArrivals from '@/components/home/NewArrivals'
import LimitedEditions from '@/components/home/LimitedEditions'
import BestSellers from '@/components/home/BestSellers'
import SaleOffers from '@/components/home/SaleOffers'
import CuratedForYou from '@/components/home/CuratedForYou'
import Newsletter from '@/components/home/Newsletter'

export default function Home() {
  return (
    <>
      <Hero />
      <SubBanners />
      <PromotionalBanners />
      <div id="new-arrivals" className="scroll-mt-20">
        <NewArrivals />
      </div>
      <LimitedEditions />
      <div id="best-sellers" className="scroll-mt-20">
        <BestSellers />
      </div>
      <div id="sale-offers" className="scroll-mt-20">
        <SaleOffers />
      </div>
      <CuratedForYou />
      <Newsletter />
    </>
  )
}
