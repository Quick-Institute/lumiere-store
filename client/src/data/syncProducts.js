import { products } from "./products";

const KEY = "lumiere_admin_products";

// keep a copy of the original products
const original = products.map((p) => ({ ...p }));

// give admin-added products everything the shop pages expect
function normalize(p) {
  return {
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [],
    description: "A beautiful piece from the Lumiere collection.",
    rating: 4.5,
    reviews: 0,
    ...p,
    images: p.images || (p.image ? [p.image] : []),
  };
}

// push a list into the shop's product array (same array every page uses)
export function applyAdminProducts(list) {
  products.splice(0, products.length, ...list.map(normalize));
}

// read what the admin saved (or the original products)
export function loadAdminProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch {
    /* ignore */
  }
  return original.map((p) => ({ ...p, stock: p.stock ?? 10 }));
}

// runs once when the app starts
applyAdminProducts(loadAdminProducts());