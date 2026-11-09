import { Mail, Phone, MapPin } from "lucide-react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h3 className="footer-logo">Lumiere</h3>
          <p className="footer-tagline">Fashion for every you</p>
          <p className="footer-about">
            Modern women's fashion made to feel good and look beautiful, every day.
          </p>
        </div>

        <div>
          <h4>Shop</h4>
          <a href="/shop?category=dresses">Dresses</a>
          <a href="/shop?category=tops">Tops</a>
          <a href="/shop?category=pants">Pants</a>
          <a href="/shop?category=jackets">Jackets</a>
          <a href="/shop?category=bags">Bags</a>
          <a href="/shop?category=shoes">Shoes</a>
        </div>

        <div>
          <h4>Help</h4>
          <a href="/orders">My Orders</a>
          <a href="/login">Login / Register</a>
          <a href="/about">About Us</a>
          <a href="/contact">Contact</a>
        </div>

        <div>
          <h4>Contact</h4>
          <p className="footer-line">
            <MapPin size={16} /> Colombo, Sri Lanka
          </p>
          <p className="footer-line">
            <Phone size={16} /> +94 77 000 0000
          </p>
          <p className="footer-line">
            <Mail size={16} /> hello@lumiere.lk
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          © 2026 Lumiere. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;