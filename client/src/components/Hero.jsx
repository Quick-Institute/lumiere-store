import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "./Hero.css";

const slides = [
  {
    label: "New Collection",
    title: "Fashion for",
    script: "every you",
    text: "Modern women's fashion made to feel good and look beautiful, every day.",
  },
  {
    label: "Summer Styles",
    title: "Effortless",
    script: "elegance",
    text: "Soft fabrics and graceful cuts for every occasion, from brunch to evening.",
  },
  {
    label: "Up to 20% off",
    title: "Your next",
    script: "favourite",
    text: "Discover the pieces everyone is loving this season, at prices you will love too.",
  },
];

function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[index];

  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-text" key={index}>
          <p className="label">{slide.label}</p>
          <h1>
            {slide.title} <span className="script">{slide.script}</span>
          </h1>
          <p className="hero-desc">{slide.text}</p>
          <Link to="/shop" className="btn hero-btn">
            Shop Now <ArrowRight size={18} />
          </Link>

          <div className="hero-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={i === index ? "dot active" : "dot"}
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="hero-image" />
    </section>
  );
}

export default Hero;