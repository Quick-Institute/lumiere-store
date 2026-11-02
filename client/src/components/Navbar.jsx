import { useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { User, ChevronDown, Flower2, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const accountLink = user ? (user.role === "admin" ? "/admin" : "/account") : "/login";

  const goToCategories = (e) => {
    e.preventDefault();

    const scrollToSection = () => {
      const section = document.getElementById("categories");
      if (section) {
        const top = section.getBoundingClientRect().top + window.scrollY - 110;
        window.scrollTo({ top, behavior: "smooth" });
      }
    };

    if (location.pathname === "/") {
      scrollToSection();
    } else {
      navigate("/");
      setTimeout(scrollToSection, 200);
    }
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo" onClick={() => setOpen(false)}>
          <Flower2 size={34} strokeWidth={1.2} color="#8664aa" />
          <div>
            <span className="logo-name">Lumiere</span>
            <span className="logo-tagline">Fashion for every you</span>
          </div>
        </Link>

        <nav className={open ? "nav-links open" : "nav-links"} onClick={() => setOpen(false)}>
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/shop">
            Shop <ChevronDown size={14} />
          </NavLink>
          <a href="/#categories" onClick={goToCategories}>
            Categories <ChevronDown size={14} />
          </a>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          {user && <NavLink to={accountLink}>Dashboard</NavLink>}
        </nav>

        <div className="nav-icons">
          <Link to={accountLink} aria-label="Account" onClick={() => setOpen(false)}>
            <User size={22} />
          </Link>
          <button
            type="button"
            className="menu-toggle"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;