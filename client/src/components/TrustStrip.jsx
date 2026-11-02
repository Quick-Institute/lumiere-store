import { Truck, ShieldCheck, RefreshCw, Headphones } from "lucide-react";
import "./TrustStrip.css";

const items = [
  { icon: Truck, title: "Free Shipping", text: "On orders over $50" },
  { icon: ShieldCheck, title: "Secure Payment", text: "100% secure checkout" },
  { icon: RefreshCw, title: "Easy Returns", text: "30-day returns policy" },
  { icon: Headphones, title: "24/7 Support", text: "We're here to help" },
];

function TrustStrip() {
  return (
    <section className="trust-strip">
      <div className="container trust-row">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="trust-item">
              <Icon size={34} strokeWidth={1.2} color="#8664aa" />
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default TrustStrip;