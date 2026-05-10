import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Package, Clock3, ShoppingBag, CheckCircle2, Loader } from 'lucide-react';
import Layout from '../components/common/Layout';
import { orderService } from '../services/orderService';

const Orders = () => {
  const { token, user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await orderService.getUserOrders();
        if (response.success) {
          setOrders(response.orders || []);
        } else {
          setError(response.message || 'Unable to load your orders.');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Unable to load your orders.');
      } finally {
        setLoading(false);
      }
    };

    if (token && user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [token, user]);

  if (!token || !user) {
    return (
      <Layout title="Your Orders - ShopEase">
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Package className="mx-auto mb-6 h-16 w-16 text-blue-600" />
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Sign in to view your orders</h1>
          <p className="mt-4 text-gray-600 dark:text-gray-300">We need your account details to show your order history.</p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/login"
              className="inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Sign In
            </Link>
            <Link
              to="/products"
              className="inline-flex rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200"
            >
              Continue Shopping
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout
      title="My Orders - ShopEase"
      description="View your order history and order status information."
      keywords="orders, order history, ecommerce orders"
    >
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Your Orders</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Review recent orders and track their status.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
            <Clock3 className="h-4 w-4" />
            Updated automatically
          </span>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-950">
            <Loader className="mx-auto h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            <p>{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-gray-700 dark:bg-gray-950">
            <ShoppingBag className="mx-auto mb-4 h-14 w-14 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">No orders yet</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">You haven’t placed any orders yet. Browse products and checkout to start shopping.</p>
            <Link
              to="/products"
              className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Shop Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id || order._id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-950">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Order #{order.id || order._id}</p>
                    <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">{order.status || order.orderStatus || 'Pending'}</h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Placed on {new Date(order.createdAt || order.createdAtAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-200">
                    <CheckCircle2 className="h-4 w-4" />
                    {order.paymentStatus || order.status || 'Paid'}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                    <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">${order.total?.toFixed(2) ?? order.totalAmount?.toFixed(2) ?? '0.00'}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Items</p>
                    <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{order.items?.length ?? 0}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Payment</p>
                    <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{order.paymentMethod || 'N/A'}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-4 rounded-3xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                  {order.items?.map((item) => (
                    <div key={item.product?.id || item.product?._id || item.id || `${item.productName}-${item.quantity}`} className="flex items-center justify-between gap-4 text-sm text-gray-700 dark:text-gray-200">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.product?.name || item.productName || 'Item'}</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <span>${((item.price || item.priceSnapshot || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Orders;
