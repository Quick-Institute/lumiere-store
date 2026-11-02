import { Link } from "react-router-dom";
import { Heart, Sparkles, Truck, ShieldCheck } from "lucide-react";
import "./About.css";

const values = [
  {
    icon: Heart,
    title: "Made for her",
    text: "Every piece is chosen with real women in mind, for every shape, size and occasion.",
  },
  {
    icon: Sparkles,
    title: "Quality you can feel",
    text: "Soft fabrics, careful stitching and styles that last beyond one season.",
  },
  {
    icon: Truck,
    title: "Delivered island-wide",
    text: "Fast delivery across Sri Lanka, with cash on delivery available.",
  },
  {
    icon: ShieldCheck,
    title: "Shop with confidence",
    text: "Secure payments and easy support whenever you need us.",
  },
];

const stats = [
  { number: "500+", label: "Happy customers" },
  { number: "100+", label: "Styles in store" },
  { number: "25", label: "Districts delivered" },
];

function About() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="label">Our Story</p>
          <h1>
            About <span className="script">Lumiere</span>
          </h1>
          <p className="page-sub">Fashion for every you.</p>
        </div>
      </section>

      <section className="container about-story">
        <div className="about-text">
          <p className="label">Who we are</p>
          <h2>Dressing women with confidence since day one</h2>
          <p>
            Lumiere is a women's clothing boutique built on a simple idea: every woman deserves
            to feel beautiful in what she wears. From everyday tops to evening dresses, our
            collection is made to fit your life.
          </p>
          <p>
            We bring together modern styles, comfortable fabrics and fair prices, so finding
            your next favourite outfit is easy, and a little bit joyful.
          </p>
          <Link to="/shop" className="btn">
            Explore the Collection
          </Link>
        </div>

        <div className="about-stats">
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <h3>{s.number}</h3>
              <p>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-values">
        <div className="container">
          <div className="section-head">
            <p className="label">Why choose us</p>
            <h2>
              What we <span className="script">believe</span>
            </h2>
          </div>

          <div className="values-grid">
            {values.map((v) => (
              <div key={v.title} className="value-card">
                <div className="value-icon">
                  <v.icon size={24} />
                </div>
                <h4>{v.title}</h4>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default About;