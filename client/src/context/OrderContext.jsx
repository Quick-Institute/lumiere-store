import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../api";
import { useAuth } from "./AuthContext";
import { loadProducts } from "../data/products";

const OrderContext = createContext(null);

const localDate = (iso) => new Date(iso).toLocaleDateString("en-CA");

// turn a database order into the shape the pages use
function normalize(o) {
  const items = (o.items || []).map((i) => ({ ...i, id: i.product }));
  return {
    id: o._id,
    number: o.number ? `#LM${o.number}` : `#${String(o._id).slice(-6).toUpperCase()}`,
    customerName: (o.user && o.user.name) || (o.shipping && o.shipping.name) || "Customer",
    userEmail: (o.user && o.user.email) || "",
    date: localDate(o.createdAt),
    items,
    itemCount: items.reduce((sum, i) => sum + (i.qty || 0), 0),
    subtotal: o.subtotal ?? o.total,
    shipping: o.shippingFee ?? 0,
    total: o.total,
    payment: o.paymentMethod,
    address: o.shipping || {},
    status: o.status,
  };
}

export function OrderProvider({ children }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // customers load their own orders, the admin loads all of them
  const refresh = useCallback(async () => {
    if (!user) {
      setOrders([]);
      return;
    }
    setLoading(true);
    try {
      const path = user.role === "admin" ? "/orders" : "/orders/mine";
      const data = await api(path);
      setOrders(data.map(normalize));
    } catch {
      /* keep the old list */
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // saves the order in the database (stock goes down on the server)
  const placeOrder = async ({ items, address, payment }) => {
    const data = await api("/orders", {
      method: "POST",
      body: {
        items: items.map((i) => ({
          productId: i.id,
          qty: i.qty,
          size: i.size,
          color: i.color,
        })),
        shipping: address,
        paymentMethod: payment,
      },
    });
    const order = normalize(data);
    setOrders((prev) => [order, ...prev]);
    await loadProducts(); // fresh stock numbers
    return order;
  };

  // admin changes a status (cancelling puts the stock back)
  const updateStatus = async (id, status) => {
    const data = await api(`/orders/${id}/status`, {
      method: "PUT",
      body: { status },
    });
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: data.status } : o)));
    await loadProducts();
  };

  return (
    <OrderContext.Provider value={{ orders, loading, refresh, placeOrder, updateStatus }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrderContext);
}