import { Truck, RefreshCw, ShieldCheck, Headphones } from "lucide-react";
import "./TopBar.css";

const messages = [
  { icon: Truck, text: "Free shipping on orders over Rs.10000" },
  { icon: RefreshCw, text: "30-day easy returns" },
  { icon: ShieldCheck, text: "Secure payments" },
  { icon: Headphones, text: "24/7 customer support" },
];

function TopBar() {
  // the list is repeated so the scroll loops without a gap
  const loop = [...messages, ...messages, ...messages, ...messages];

  return (
    <div className="topbar">
      <div className="topbar-track">
        {loop.map((msg, i) => {
          const Icon = msg.icon;
          return (
            <span key={i} className="topbar-item">
              <Icon size={16} /> {msg.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default TopBar;