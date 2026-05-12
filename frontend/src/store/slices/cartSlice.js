import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { cartService } from '../../services/cartService';

/**
 * Async thunks for backend synchronization
 */

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      if (response.success) {
        return response.cart;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCartAsync = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity, suppressSuccessToast: _suppress }, { rejectWithValue }) => {
    try {
      const response = await cartService.addToCart(productId, quantity);
      if (response.success) {
        return response.cart;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const removeFromCartAsync = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await cartService.removeFromCart(productId);
      if (response.success) {
        return response.cart;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

export const updateCartItemAsync = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartService.updateCartItem(productId, quantity);
      if (response.success) {
        return response.cart;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
    }
  }
);

export const clearCartAsync = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.clearCart();
      if (response.success) {
        return response.cart;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

const initialState = {
  items: [],
  totals: {
    itemCount: 0,
    totalPrice: 0
  },
  isOpen: false,
  loading: false,
  error: null,
  synced: false // Track if cart is synced with backend
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch cart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totals = action.payload.totals || { itemCount: 0, totalPrice: 0 };
        state.synced = true;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.synced = false;
      });

    // Add to cart
    builder
      .addCase(addToCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totals = action.payload.totals || { itemCount: 0, totalPrice: 0 };
        if (action.meta.arg.suppressSuccessToast) {
          return;
        }
        const productId = String(action.meta.arg.productId || '');
        const match = (action.payload.items || []).find(
          (i) => String(i.product?.id) === productId
        );
        const name = match?.product?.name || 'Product';
        if (productId) {
          toast.success(`${name} added to cart · Product ID: ${productId}`);
        }
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        const msg = action.payload;
        if (msg != null && msg !== '') {
          toast.error(typeof msg === 'string' ? msg : String(msg));
        }
      });

    // Remove from cart
    builder
      .addCase(removeFromCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totals = action.payload.totals || { itemCount: 0, totalPrice: 0 };
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update cart item
    builder
      .addCase(updateCartItemAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totals = action.payload.totals || { itemCount: 0, totalPrice: 0 };
      })
      .addCase(updateCartItemAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Clear cart
    builder
      .addCase(clearCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [];
        state.totals = { itemCount: 0, totalPrice: 0 };
      })
      .addCase(clearCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { toggleCart, setError, clearError } = cartSlice.actions;
export default cartSlice.reducer;