import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const storageKey = user ? `lumiere_wishlist_${user.email}` : null;

  const [ids, setIds] = useState([]);

  // Load this customer's saved list when they log in
  useEffect(() => {
    if (!storageKey) {
      setIds([]);
      return;
    }
    try {
      setIds(JSON.parse(localStorage.getItem(storageKey)) || []);
    } catch {
      setIds([]);
    }
  }, [storageKey]);

  const has = (id) => ids.includes(id);

  const toggle = (id) => {
    if (!storageKey) return;
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <WishlistContext.Provider value={{ ids, has, toggle, count: ids.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}