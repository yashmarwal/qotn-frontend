'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CartItem, Product } from '@/types';
import { findVariantId } from '@/lib/adapters';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; size: string; color: string; quantity: number; customStitchingId?: string }
  | { type: 'REMOVE_ITEM'; productId: string; size: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; size: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'HYDRATE'; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, items: action.items };
    case 'ADD_ITEM': {
      // findVariantId returns null if not found — store null so the key is always present in JSON
      const variantId = findVariantId(action.product, action.size, action.color);
      const existing = state.items.findIndex(
        (i) => i.product.id === action.product.id && i.size === action.size
      );
      if (existing > -1) {
        const updated = [...state.items];
        updated[existing] = {
          ...updated[existing],
          quantity: updated[existing].quantity + action.quantity,
          // Update variantId if we now have one
          ...(variantId && { variantId }),
          ...(action.customStitchingId && { customStitchingId: action.customStitchingId }),
        };
        return { ...state, items: updated };
      }
      return {
        ...state,
        items: [...state.items, {
          product: action.product,
          size: action.size,
          color: action.color,
          quantity: action.quantity,
          variantId: variantId ?? undefined,
          customStitchingId: action.customStitchingId,
        }],
      };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => !(i.product.id === action.productId && i.size === action.size)) };
    case 'UPDATE_QUANTITY':
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => !(i.product.id === action.productId && i.size === action.size)) };
      }
      return { ...state, items: state.items.map((i) => i.product.id === action.productId && i.size === action.size ? { ...i, quantity: action.quantity } : i) };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'OPEN_CART':
      return { ...state, isOpen: true };
    case 'CLOSE_CART':
      return { ...state, isOpen: false };
    default:
      return state;
  }
}

// Lazy initializer reads localStorage synchronously on first render — no hydration flash
function initCart(): CartState {
  if (typeof window === 'undefined') return { items: [], isOpen: false };
  try {
    const saved = localStorage.getItem('qotn-cart');
    return { items: saved ? JSON.parse(saved) : [], isOpen: false };
  } catch {
    return { items: [], isOpen: false };
  }
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, size: string, color: string, quantity?: number, customStitchingId?: string) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, initCart);

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem('qotn-cart', JSON.stringify(state.items));
    } catch {}
  }, [state.items]);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items: state.items, isOpen: state.isOpen,
      addItem: (product, size, color, quantity = 1, customStitchingId) =>
        dispatch({ type: 'ADD_ITEM', product, size, color, quantity, customStitchingId }),
      removeItem: (productId, size) => dispatch({ type: 'REMOVE_ITEM', productId, size }),
      updateQuantity: (productId, size, quantity) => dispatch({ type: 'UPDATE_QUANTITY', productId, size, quantity }),
      clearCart: () => dispatch({ type: 'CLEAR_CART' }),
      openCart: () => dispatch({ type: 'OPEN_CART' }),
      closeCart: () => dispatch({ type: 'CLOSE_CART' }),
      totalItems, totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
