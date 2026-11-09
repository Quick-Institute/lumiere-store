import { Sparkles, Shirt, Scissors, Layers, Handbag, ArrowRight } from "lucide-react";
import "./CategoryList.css";

const categories = [
  { name: "Dresses", slug: "dresses", icon: Sparkles },
  { name: "Tops", slug: "tops", icon: Shirt },
  { name: "Pants", slug: "pants", icon: Scissors },
  { name: "Jackets", slug: "jackets", icon: Layers },
  { name: "Bags", slug: "bags", icon: Handbag },
];

function CategoryList() {
  return (
    <section className="categories" id="categories">
      <div className="container category-row">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <a
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="category-item"
            >
              <span className="category-circle">
                <Icon size={38} strokeWidth={1.2} />
              </span>
              <span className="category-name">{cat.name}</span>
              <span className="category-link">
                Shop Now <ArrowRight size={13} />
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

export default CategoryList;