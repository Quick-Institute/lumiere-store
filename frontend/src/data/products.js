import { api } from "../api";

const KEY = "lumiere_products_v3";

// the database uses _id, the pages use id
function normalize(p) {
  return { ...p, id: p._id, sizes: p.sizes || [], colors: p.colors || [] };
}

function readCache() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(saved)) return saved;
  } catch {
    /* ignore */
  }
  return [];
}

// every page imports this same array
export const products = readCache();

function setAll(list) {
  const next = [...list];
  products.splice(0, products.length, ...next);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full: the list still works for this visit */
  }
}

// called once before the app starts
export async function loadProducts() {
  try {
    const data = await api("/products");
    setAll(data.filter((p) => p.category !== "shoes").map(normalize));
  } catch {
    /* server not reachable: keep the saved list */
  }
  return products;
}

// kept so older code (stock changes on orders) still works
export function saveProducts(list) {
  setAll(list);
  return true;
}

// admin actions, saved in the database
export async function createProduct(data) {
  const saved = normalize(await api("/products", { method: "POST", body: data }));
  setAll([...products, saved]);
  return saved;
}

export async function updateProduct(id, data) {
  const saved = normalize(await api(`/products/${id}`, { method: "PUT", body: data }));
  setAll(products.map((p) => (p.id === id ? saved : p)));
  return saved;
}

export async function deleteProduct(id) {
  await api(`/products/${id}`, { method: "DELETE" });
  setAll(products.filter((p) => p.id !== id));
}