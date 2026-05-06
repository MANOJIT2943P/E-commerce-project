import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    addToCartAsync,
    clearCartAsync,
    fetchCart,
    removeFromCartAsync,
    toggleCart,
    updateCartItemAsync
} from '../store/slices/cartSlice';

export const useCart = () => {
  const dispatch = useDispatch();
  const { items, totals, isOpen, loading, error } = useSelector((state) => state.cart);
  const { token, user } = useSelector((state) => state.auth);

  // Fetch cart when user logs in or component mounts
  useEffect(() => {
    if (token && user) {
      dispatch(fetchCart());
    }
  }, [token, user, dispatch]);

  const addItem = (productId, quantity = 1) => {
    dispatch(addToCartAsync({ productId, quantity }));
  };

  const removeItem = (productId) => {
    dispatch(removeFromCartAsync(productId));
  };

  const updateItemQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      dispatch(removeFromCartAsync(productId));
    } else {
      dispatch(updateCartItemAsync({ productId, quantity }));
    }
  };

  const clear = () => {
    dispatch(clearCartAsync());
  };

  const toggle = () => {
    dispatch(toggleCart());
  };

  return {
    items,
    totals,
    itemCount: totals.itemCount,
    total: totals.totalPrice,
    isOpen,
    loading,
    error,
    addItem,
    removeItem,
    updateItemQuantity,
    clear,
    toggle,
  };
};