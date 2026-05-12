import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaStar } from 'react-icons/fa'; // Add this for star icons
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { productService } from '../services/productService';
import { useCart } from '../hooks/useCart';
import toast from 'react-hot-toast';

const ProductView = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      // Check if product ID is a valid MongoDB ObjectId (24 hex characters)
      const isValidProductId = (id) => {
        return /^[a-f\d]{24}$/i.test(id);
      };

      if (!isValidProductId(id)) {
        setError('Invalid product ID');
        setIsLoading(false);
        return;
      }

      try {
        const data = await productService.getProduct(id);
        if (data) {
          setProduct(data);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError('Failed to load product');
      }
      setIsLoading(false);
    };
    fetchProduct();
  }, [id]);

  // Helper to render stars
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          color={i <= rating ? '#fbbf24' : '#d1d5db'}
          className="inline mr-1"
        />
      );
    }
    return stars;
  };

  // Add to cart handler
  const handleAddToCart = () => {
    // Check if product ID is a valid MongoDB ObjectId (24 hex characters)
    const isValidProductId = (id) => {
      return /^[a-f\d]{24}$/i.test(id);
    };

    if (!isValidProductId(product.id)) {
      toast.error('This product cannot be added to cart');
      return;
    }

    addItem(product.id, 1);
  };

  if (isLoading) return <LoadingSpinner size="large" className="py-20" />;
  if (error) return <div className="text-center py-20 text-red-600 text-lg">{error}</div>;
  if (!product) return <div className="text-center py-20">Product not found.</div>;

  return (
    <Layout title={product.name}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <img src={product.images[0]} alt={product.name} className="w-full md:w-1/2 rounded-xl shadow-lg" />
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <div className="mb-2">
              {renderStars(product.rating)}
              <span className="ml-2 text-gray-500">({product.rating}/5)</span>
            </div>
            <p className="text-lg text-gray-600 mb-4">{product.description}</p>
            <div className="text-2xl font-bold text-blue-600 mb-4">${product.price}</div>
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || !/^[a-f\d]{24}$/i.test(product.id)}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductView;