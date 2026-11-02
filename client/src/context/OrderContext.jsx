import { createContext, useContext, useState } from "react";
import { products, saveProducts } from "../data/products";

const OrderContext = createContext(null);
const STORAGE_KEY = "lumiere_orders";
const FIRST_NUMBER = 2001;

function loadOrders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

// find which product a cart item belongs to
function productIdOf(item) {
  if (item.productId !== undefined) return Number(item.productId);
  if (item.product && item.product.id !== undefined) return Number(item.product.id);
  return parseInt(item.id, 10);
}

// direction -1 = take stock out (order placed), +1 = put it back (order cancelled)
function adjustStock(items, direction) {
  const updated = products.map((p) => {
    if (p.stock === undefined) return p;
    const qty = items
      .filter((i) => productIdOf(i) === p.id)
      .reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
    if (!qty) return p;
    return { ...p, stock: Math.max(0, p.stock + direction * qty) };
  });
  saveProducts(updated);
}

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(loadOrders);

  const save = (next) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  // Create a new order and return it
  const placeOrder = ({ user, items, subtotal, shipping, total, payment, address }) => {
    const order = {
      id: `#LM${FIRST_NUMBER + orders.length}`,
      userEmail: user.email,
      customerName: user.name,
      date: new Date().toISOString().slice(0, 10),
      items,
      itemCount: items.reduce((sum, i) => sum + i.qty, 0),
      subtotal,
      shipping,
      total,
      payment,
      address,
      status: "Pending",
    };
    const next = [order, ...orders];
    setOrders(next);
    save(next);

    // reduce stock for every product in the order
    adjustStock(items, -1);

    return order;
  };

  // Used by the admin to change an order's status
  const updateStatus = (id, status) => {
    const order = orders.find((o) => o.id === id);

    if (order) {
      if (status === "Cancelled" && order.status !== "Cancelled") {
        adjustStock(order.items, 1); // cancelled: give the stock back
      } else if (status !== "Cancelled" && order.status === "Cancelled") {
        adjustStock(order.items, -1); // un-cancelled: take it out again
      }
    }

    const next = orders.map((o) => (o.id === id ? { ...o, status } : o));
    setOrders(next);
    save(next);
  };

  return (
    <OrderContext.Provider value={{ orders, placeOrder, updateStatus }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrderContext);
}