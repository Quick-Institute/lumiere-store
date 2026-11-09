import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";
import "./Shop.css";

const categories = ["all", "dresses", "tops", "pants", "jackets", "bags"];
const sizes = ["XS", "S", "M", "L", "XL"];

function Shop() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "all";
  const search = params.get("q") || "";

  const [size, setSize] = useState("");
  const [sort, setSort] = useState("featured");

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    setParams(next);
  };

  const clearFilters = () => {
    setSize("");
    setSort("featured");
    setParams({});
  };

  const visible = useMemo(() => {
    let list = products.filter((p) => {
      if (p.category === "shoes") return false;
      if (category !== "all" && p.category !== category) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (size && !p.sizes.includes(size)) return false;
      return true;
    });

    if (sort === "price-low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [category, search, size, sort]);

  const chips = [];
  if (search)
    chips.push({ key: "q", label: `"${search}"`, clear: () => updateParam("q", "") });
  if (size) chips.push({ key: "size", label: `Size ${size}`, clear: () => setSize("") });

  return (
    <>
      <section className="shop-hero">
        <div className="container">
          <p className="label">The Lumiere Collection</p>
          <h1>
            {category === "all" ? (
              <>
                Shop <span className="script">All</span>
              </>
            ) : (
              <span className="cap">{category}</span>
            )}
          </h1>
          <p className="shop-sub">Find your next favourite piece.</p>
        </div>
      </section>

      <div className="container">
        <div className="cat-pills">
          {categories.map((c) => (
            <button
              key={c}
              className={category === c ? "pill active" : "pill"}
              onClick={() => updateParam("category", c)}
            >
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>

        <div className="filter-bar">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search products"
              value={search}
              onChange={(e) => updateParam("q", e.target.value)}
            />
          </div>

          <select value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="">All sizes</option>
            {sizes.map((s) => (
              <option key={s} value={s}>
                Size {s}
              </option>
            ))}
          </select>

          <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>

        <div className="result-row">
          <p className="result-count">{visible.length} products</p>
          {chips.length > 0 && (
            <div className="active-chips">
              {chips.map((c) => (
                <button key={c.key} className="active-chip" onClick={c.clear}>
                  <span>{c.label}</span>
                  <X size={13} />
                </button>
              ))}
              <button className="clear-link" onClick={clearFilters}>
                Clear all
              </button>
            </div>
          )}
        </div>

        {visible.length === 0 ? (
          <div className="no-results">
            <p>No products match your filters.</p>
            <button className="btn" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="product-grid shop-grid">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Shop;