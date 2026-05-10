import React from 'react';
import { Link } from 'react-router-dom';
import { Loader, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Layout from '../components/common/Layout';
import { useCart } from '../hooks/useCart';

const Cart = () => {
  const {
    items,
    totals,
    loading,
    error,
    removeItem,
    updateItemQuantity,
    clear
  } = useCart();

  const handleDecrease = (productId, quantity) => {
    if (quantity <= 1) {
      removeItem(productId);
    } else {
      updateItemQuantity(productId, quantity - 1);
    }
  };

  const handleIncrease = (productId, quantity, stock) => {
    if (quantity < stock) {
      updateItemQuantity(productId, quantity + 1);
    }
  };

  return (
    <Layout
      title="Your Cart - ShopEase"
      description="Review your selected items, update quantities, and proceed to checkout."
      keywords="shopping cart, ecommerce cart, checkout"
    >
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Shopping Cart</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Review your cart items and proceed to secure checkout.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        {loading && !items.length ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
            <Loader className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-10 text-center">
            <ShoppingBag className="mx-auto mb-4 h-14 w-14 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your cart is empty</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Add products to your cart to get started.</p>
            <Link
              to="/products"
              className="mt-6 inline-flex rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.7fr_0.9fr]">
            <div className="space-y-6">
              {items.map((item) => {
                const productId = item.product?.id || item.product?._id || item.id;
                return (
                  <div key={productId} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-950">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center">
                      <img
                        src={
                          item.product?.imageUrl
                            ? `http://localhost:5000${item.product.imageUrl}`
                            : `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%23e5e7eb'/%3E%3Cpath d='M36 46h48l6-12H30l6 12zm-8 8v32a8 8 0 0 0 8 8h48a8 8 0 0 0 8-8V54H28zm21 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm26 0a4 4 0 1 1 0 8 4 4 0 0 1 0-8z' fill='%239ca3af'/%3E%3C/svg%3E`
                        }
                        alt={item.product?.name || 'Cart item'}
                        className="h-32 w-32 rounded-3xl object-cover bg-gray-100 dark:bg-gray-800"
                      />

                      <div className="flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {item.product?.name || 'Product'}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {item.product?.category || 'Category'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(productId)}
                            className="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:items-center">
                          <div className="flex items-center gap-3 rounded-3xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
                            <button
                              type="button"
                              onClick={() => handleDecrease(productId, item.quantity)}
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleIncrease(productId, item.quantity, item.product?.stock || 999)}
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            ${item.subtotal?.toFixed(2) ?? ((item.product?.price || 0) * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-950">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Items</span>
                  <span>{totals.itemCount} item{totals.itemCount === 1 ? '' : 's'}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>${totals.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>${totals.totalPrice >= 100 ? '0.00' : '9.99'}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Estimated tax</span>
                  <span>${(totals.totalPrice * 0.08).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                <div className="flex items-center justify-between text-lg font-semibold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>${(totals.totalPrice + (totals.totalPrice >= 100 ? 0 : 9.99) + totals.totalPrice * 0.08).toFixed(2)}</span>
                </div>

                <div className="mt-6 space-y-3">
                  <Link
                    to="/checkout"
                    className="block rounded-3xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Proceed to Checkout
                  </Link>
                  <button
                    type="button"
                    onClick={clear}
                    className="w-full rounded-3xl border border-red-300 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/50"
                  >
                    Clear Cart
                  </button>
                  <Link
                    to="/products"
                    className="block rounded-3xl border border-gray-300 px-5 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Cart;
