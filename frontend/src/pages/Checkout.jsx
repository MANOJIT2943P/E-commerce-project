import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import Layout from '../components/common/Layout';
import { useCart } from '../hooks/useCart';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart } from '../store/slices/cartSlice';
import { orderService } from '../services/orderService';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totals, loading: cartLoading, error: cartError } = useCart();
  const { token, user } = useSelector((state) => state.auth);

  const [customerContact, setCustomerContact] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: ''
  });
  const [shippingAddress, setShippingAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [formError, setFormError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const summary = useMemo(() => {
    const subtotal = totals.totalPrice || 0;
    const shipping = subtotal >= 100 ? 0 : 9.99;
    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const total = parseFloat((subtotal + shipping + tax).toFixed(2));
    return { subtotal, shipping, tax, total };
  }, [totals.totalPrice]);

  const validateForm = () => {
    if (!customerContact.fullName || !customerContact.email || !customerContact.phone) {
      return 'Please complete your contact information.';
    }

    if (!shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.country) {
      return 'Please complete your shipping address.';
    }

    if (!paymentMethod) {
      return 'Please select a payment method.';
    }

    if (items.length === 0) {
      return 'Your cart is empty. Please add items before checking out.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSubmitError('');

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await orderService.checkout({
        customerContact,
        shippingAddress,
        paymentMethod
      });

      if (!response.success) {
        setSubmitError(response.message || 'Unable to complete checkout.');
        setIsSubmitting(false);
        return;
      }

      setOrderSuccess(response.order);
      await dispatch(fetchCart());
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || 'Unable to complete checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token || !user) {
    return (
      <Layout title="Checkout - ShopEase">
        <section className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Login required</h1>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Please sign in to complete your checkout.</p>
          <div className="mt-6 space-x-3">
            <Link
              to="/login"
              className="inline-flex rounded-full bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              Sign In
            </Link>
            <Link
              to="/products"
              className="inline-flex rounded-full border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200"
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
      title="Checkout - ShopEase"
      description="Complete your order with shipping details, contact information, and secure payment." 
      keywords="checkout, ecommerce checkout, place order"
    >
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Checkout</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Fill in your shipping details and confirm your order.</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
            Order total: <span className="font-semibold text-gray-900 dark:text-white">${summary.total.toFixed(2)}</span>
          </div>
        </div>

        {cartError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            {cartError}
          </div>
        )}

        {formError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            {formError}
          </div>
        )}

        {submitError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            {submitError}
          </div>
        )}

        {orderSuccess ? (
          <div className="rounded-3xl border border-green-200 bg-green-50 p-8 text-center text-gray-900 dark:border-green-700 dark:bg-green-950 dark:text-green-100">
            <h2 className="text-2xl font-semibold">Order placed successfully!</h2>
            <p className="mt-3 text-gray-700 dark:text-green-100">Your order #{orderSuccess._id || orderSuccess.id} is confirmed.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/products"
                className="inline-flex rounded-full bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
            <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-950">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Contact information</h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">We will use these details to send your order confirmation.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full name
                  <input
                    type="text"
                    value={customerContact.fullName}
                    onChange={(e) => setCustomerContact({ ...customerContact, fullName: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="Jane Doe"
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address
                  <input
                    type="email"
                    value={customerContact.email}
                    onChange={(e) => setCustomerContact({ ...customerContact, email: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="jane@example.com"
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 sm:col-span-2">
                  Phone number
                  <input
                    type="tel"
                    value={customerContact.phone}
                    onChange={(e) => setCustomerContact({ ...customerContact, phone: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="+1 (555) 123-4567"
                  />
                </label>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Shipping address</h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Where should we deliver your order?</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 sm:col-span-2">
                  Address line 1
                  <input
                    type="text"
                    value={shippingAddress.addressLine1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="123 Main Street"
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 sm:col-span-2">
                  Address line 2 (optional)
                  <input
                    type="text"
                    value={shippingAddress.addressLine2}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  City
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="New York"
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  State / Region
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="NY"
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Postal code
                  <input
                    type="text"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="10001"
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Country
                  <input
                    type="text"
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="United States"
                  />
                </label>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payment details</h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">We only simulate payment for this checkout flow.</p>
              </div>

              <fieldset className="grid gap-3 rounded-3xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                <legend className="text-sm font-medium text-gray-900 dark:text-gray-100">Payment method</legend>
                <label className="flex items-center gap-3 rounded-2xl border border-transparent bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition hover:border-blue-300 dark:bg-gray-800 dark:text-gray-100">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={paymentMethod === 'CARD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-blue-600"
                  />
                  Credit / Debit Card
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-transparent bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition hover:border-blue-300 dark:bg-gray-800 dark:text-gray-100">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="PAYPAL"
                    checked={paymentMethod === 'PAYPAL'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-blue-600"
                  />
                  PayPal
                </label>
              </fieldset>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full justify-center rounded-3xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Placing order…' : 'Place order'}
              </button>
            </form>

            <aside className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-950">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Order summary</h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Your cart items will be included in this order.</p>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>${summary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span>${summary.shipping.toFixed(2)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Estimated tax</span>
                    <span>${summary.tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-lg font-semibold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>${summary.total.toFixed(2)}</span>
                </div>

                <div className="rounded-3xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Items in cart</p>
                  <div className="mt-4 space-y-3">
                    {items.map((item) => {
                      const productId = item.product?.id || item.product?._id || item.id;
                      return (
                        <div key={productId} className="flex items-center justify-between gap-4 text-sm text-gray-700 dark:text-gray-200">
                          <span>{item.product?.name || 'Product'} × {item.quantity}</span>
                          <span>${item.subtotal?.toFixed(2) ?? ((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Checkout;
