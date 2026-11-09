import { ArrowRight } from "lucide-react";
import "./SaleBanner.css";

function SaleBanner() {
  return (
    <section className="sale-banner">
      <div
        className="sale-image"
        style={{ backgroundImage: "url(/images/sale.jpg)" }}
      />
      <div className="container sale-content">
        <p className="label">Special Offer</p>
        <h2>Up to 50% Off</h2>
        <p className="sale-text">
          Refresh your wardrobe with our exclusive seasonal sale.
        </p>
        <a href="/shop" className="btn">
          Shop Sale <ArrowRight size={18} />
        </a>
      </div>
    </section>
  );
}

export default SaleBanner;