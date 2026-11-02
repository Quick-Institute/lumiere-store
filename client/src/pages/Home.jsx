import Hero from "../components/Hero";
import CategoryList from "../components/CategoryList";
import BestSellers from "../components/BestSellers";
import SaleBanner from "../components/SaleBanner";
import TrustStrip from "../components/TrustStrip";

function Home() {
  return (
    <>
      <Hero />
      <CategoryList />
      <BestSellers />
      <SaleBanner />
      <TrustStrip />
    </>
  );
}

export default Home;