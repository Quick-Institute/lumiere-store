const defaults = [
  { id: 1, name: "Floral Midi Dress", category: "dresses", price: 12400, oldPrice: 15500, discount: 20, rating: 4.5, reviews: 124, sizes: ["XS", "S", "M", "L"], colors: ["#000000", "#d9c3b8", "#c46b72", "#3b5b8a"], image: "/images/products/p1.jpg", stock: 15 },
  { id: 2, name: "Ribbed Knit Sweater", category: "tops", price: 8900, oldPrice: null, discount: null, rating: 4.5, reviews: 98, sizes: ["S", "M", "L", "XL"], colors: ["#f2ede8", "#d9c3b8", "#000000"], image: "/images/products/p2.jpg", stock: 3 },
  { id: 3, name: "Elegant Blazer", category: "jackets", price: 17900, oldPrice: null, discount: null, rating: 4.5, reviews: 76, sizes: ["S", "M", "L"], colors: ["#c9ad93", "#000000"], image: "/images/products/p3.jpg", stock: 12 },
  { id: 4, name: "Wide Leg Pants", category: "pants", price: 10500, oldPrice: null, discount: null, rating: 4, reviews: 62, sizes: ["XS", "S", "M", "L", "XL"], colors: ["#000000"], image: "/images/products/p4.jpg", stock: 5 },
  { id: 5, name: "Satin Slip Dress", category: "dresses", price: 14900, oldPrice: 18600, discount: 20, rating: 5, reviews: 54, sizes: ["XS", "S", "M"], colors: ["#c46b72", "#000000"], image: "/images/products/p1.jpg", stock: 18 },
  { id: 6, name: "Cotton Button Blouse", category: "tops", price: 7500, oldPrice: null, discount: null, rating: 4, reviews: 41, sizes: ["S", "M", "L"], colors: ["#f2ede8", "#3b5b8a"], image: "/images/products/p2.jpg", stock: 2 },
  { id: 7, name: "Linen Trousers", category: "pants", price: 9800, oldPrice: 12250, discount: 20, rating: 4.5, reviews: 33, sizes: ["S", "M", "L", "XL"], colors: ["#c9ad93", "#f2ede8"], image: "/images/products/p4.jpg", stock: 9 },
  { id: 8, name: "Denim Jacket", category: "jackets", price: 13500, oldPrice: null, discount: null, rating: 4, reviews: 47, sizes: ["S", "M", "L"], colors: ["#3b5b8a"], image: "/images/products/p3.jpg", stock: 14 },
  { id: 9, name: "Linen Maxi Dress", category: "dresses", price: 16200, oldPrice: null, discount: null, rating: 4.5, reviews: 29, sizes: ["S", "M", "L", "XL"], colors: ["#d9c3b8", "#f2ede8"], image: "/images/products/p1.jpg", stock: 10 },
  { id: 10, name: "Leather Tote Bag", category: "bags", price: 11900, oldPrice: null, discount: null, rating: 5, reviews: 88, sizes: [], colors: ["#000000", "#c9ad93"], image: "/images/products/p3.jpg", stock: 8 },
  { id: 11, name: "Mini Shoulder Bag", category: "bags", price: 6900, oldPrice: 8600, discount: 20, rating: 4, reviews: 36, sizes: [], colors: ["#c46b72", "#000000"], image: "/images/products/p2.jpg", stock: 20 },
  { id: 12, name: "Block Heel Sandals", category: "shoes", price: 9500, oldPrice: null, discount: null, rating: 4.5, reviews: 52, sizes: ["S", "M", "L"], colors: ["#d9c3b8", "#000000"], image: "/images/products/p4.jpg", stock: 6 },
];

const KEY = "lumiere_products_v2";

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch {
    /* ignore */
  }
  return defaults.map((p) => ({ ...p }));
}

// every page imports this same array
export const products = load();

// called by the admin page: updates the shop and remembers it
export function saveProducts(list) {
  products.splice(0, products.length, ...list);
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}