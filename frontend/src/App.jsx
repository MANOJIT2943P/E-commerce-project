import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { store } from './store/store';
import { initializeAuth, initializeAuthSuccess, initializeAuthFailure } from './store/slices/authSlice';
import { authService } from './services/authService';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedAdminRoute from './components/common/ProtectedAdminRoute';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import Login from './pages/Login';
import ProductView from './pages/ProductView';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminStats from './pages/AdminStats';
import AdminRegister from './pages/AdminRegister';

// Auth initializer component
function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const { isInitialized } = useSelector((state) => state.auth);

  useEffect(() => {
    const initSession = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        dispatch(initializeAuthFailure());
        return;
      }

      dispatch(initializeAuth());

      try {
        const user = await authService.getCurrentUser();
        dispatch(initializeAuthSuccess(user));
      } catch (err) {
        console.error('Session initialization error:', err);
        dispatch(initializeAuthFailure());
      }
    };

    initSession();
  }, [dispatch]);

  // Show loading spinner while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  return children;
}

function App() {
  return (
    <HelmetProvider>
      <Provider store={store}>
        <Router>
          <AuthInitializer>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/login" element={<Login />} />
              <Route path="/products/:id" element={<ProductView />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Admin Routes - Protected */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                } 
              />
              <Route 
                path="/admin/products" 
                element={
                  <ProtectedAdminRoute>
                    <AdminProducts />
                  </ProtectedAdminRoute>
                } 
              />
              <Route 
                path="/admin/stats" 
                element={
                  <ProtectedAdminRoute>
                    <AdminStats />
                  </ProtectedAdminRoute>
                } 
              />
              <Route 
                path="/admin/register" 
                element={
                  <ProtectedAdminRoute>
                    <AdminRegister />
                  </ProtectedAdminRoute>
                } 
              />
            </Routes>
          </AuthInitializer>
        </Router>
      </Provider>
    </HelmetProvider>
  );
}

export default App;