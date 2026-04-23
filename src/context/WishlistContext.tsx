import React, { createContext, useContext, useState, useCallback } from "react";
import type { Product } from "@/data/products";

interface WishlistContextType {
  items:             Product[];
  toggleWishlist:    (product: Product) => void;
  isInWishlist:      (productId: string) => boolean;
  count:             number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Product[]>(() => {
    try { return JSON.parse(localStorage.getItem("iherb-wishlist") ?? "[]"); }
    catch { return []; }
  });

  const toggleWishlist = useCallback((product: Product) => {
    setItems(prev => {
      const exists = prev.some(p => p.id === product.id);
      const next = exists ? prev.filter(p => p.id !== product.id) : [...prev, product];
      localStorage.setItem("iherb-wishlist", JSON.stringify(next));
      return next;
    });
  }, []);

  const isInWishlist = useCallback((id: string) => items.some(p => p.id === id), [items]);

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, isInWishlist, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
