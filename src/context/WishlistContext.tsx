'use client';

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { Product } from '@/types';

interface WishlistState { items: Product[] }

type WishlistAction =
  | { type: 'ADD_ITEM'; product: Product }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'HYDRATE'; items: Product[] };

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'HYDRATE': return { items: action.items };
    case 'ADD_ITEM':
      if (state.items.find((i) => i.id === action.product.id)) return state;
      return { items: [...state.items, action.product] };
    case 'REMOVE_ITEM':
      return { items: state.items.filter((i) => i.id !== action.productId) };
    default:
      return state;
  }
}

interface WishlistContextType {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (product: Product) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('qotn-wishlist');
      if (saved) dispatch({ type: 'HYDRATE', items: JSON.parse(saved) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem('qotn-wishlist', JSON.stringify(state.items));
  }, [state.items, hydrated]);

  return (
    <WishlistContext.Provider value={{
      items: state.items,
      addItem: (product) => dispatch({ type: 'ADD_ITEM', product }),
      removeItem: (productId) => dispatch({ type: 'REMOVE_ITEM', productId }),
      isInWishlist: (productId) => state.items.some((i) => i.id === productId),
      toggleItem: (product) => state.items.some((i) => i.id === product.id)
        ? dispatch({ type: 'REMOVE_ITEM', productId: product.id })
        : dispatch({ type: 'ADD_ITEM', product }),
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
