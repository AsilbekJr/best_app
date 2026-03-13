import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

interface CartState {
  items: Record<string, CartItem>;
  totalAmount: number;
}

const initialState: CartState = {
  items: {},
  totalAmount: 0,
};

const calculateTotal = (items: Record<string, CartItem>) => {
  return Object.values(items).reduce(
    (total, item) => total + (item.price || 0) * item.quantity,
    0
  );
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity'> & { quantity?: number }>) => {
      const product = action.payload;
      const quantityToAdd = product.quantity || 1;
      
      if (state.items[product.id]) {
        state.items[product.id].quantity += quantityToAdd;
      } else {
        state.items[product.id] = { ...product, quantity: quantityToAdd };
      }
      state.totalAmount = calculateTotal(state.items);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        delete state.items[id];
      } else if (state.items[id]) {
        state.items[id].quantity = quantity;
      }
      state.totalAmount = calculateTotal(state.items);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      delete state.items[action.payload];
      state.totalAmount = calculateTotal(state.items);
    },
    clearCart: (state) => {
      state.items = {};
      state.totalAmount = 0;
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
