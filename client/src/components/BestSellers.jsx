import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { products } from "../data/products";
import "./BestSellers.css";

function BestSellers() {
  const featured = products.slice(0, 4);

  return (
    <section className="best-sellers">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="label">Best Sellers</p>
            <h2>Most Loved Styles</h2>
          </div>
          <Link to="/shop" className="view-all">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="product-grid">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default BestSellers;