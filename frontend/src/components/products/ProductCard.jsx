import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import toast from 'react-hot-toast';

const ProductCard = ({ product, viewMode }) => {
  const { addItem } = useCart();

  // Check if product ID is a valid MongoDB ObjectId (24 hex characters)
  const isValidProductId = (id) => {
    return /^[a-f\d]{24}$/i.test(id);
  };

  const canAddToCart = product.inStock && isValidProductId(product.id);
  const canViewProduct = isValidProductId(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canAddToCart) {
      toast.error('This product cannot be added to cart');
      return;
    }
    addItem(product.id, 1);
    toast.success(`${product.name} added to cart!`);
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="flex">
          {/* Product Image */}
          <div className="w-48 h-48 flex-shrink-0">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {product.brand}
                  </span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {product.category}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  <Link
                    to={`/products/${product.id}`}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {product.name}
                  </Link>
                </h3>

                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {product.rating}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({product.reviewCount} reviews)
                    </span>
                  </div>

                  {product.inStock ? (
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      In Stock
                    </span>
                  ) : (
                    <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                      Out of Stock
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Add to Wishlist"
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                    <Link
                      to={`/products/${product.id}`}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={canViewProduct ? "Quick View" : "Product details not available"}
                      onClick={(e) => !canViewProduct && e.preventDefault()}
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={handleAddToCart}
                      disabled={!canAddToCart}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                      title={!canAddToCart ? 'Product not available for purchase' : 'Add to Cart'}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group overflow-hidden">
      {/* Product Image */}
      <div className="relative overflow-hidden">
        {canViewProduct ? (
          <Link to={`/products/${product.id}`}>
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </Link>
        ) : (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-64 object-cover cursor-not-allowed opacity-75"
            title="Product details not available"
          />
        )}

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className="p-2 bg-white rounded-full text-gray-900 hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={!canAddToCart ? 'Product not available for purchase' : 'Add to Cart'}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
          <button
            className="p-2 bg-white rounded-full text-gray-900 hover:bg-red-600 hover:text-white transition-colors"
            title="Add to Wishlist"
          >
            <Heart className="w-5 h-5" />
          </button>
          <Link
            to={`/products/${product.id}`}
            className="p-2 bg-white rounded-full text-gray-900 hover:bg-green-600 hover:text-white transition-colors"
            title="Quick View"
          >
            <Eye className="w-5 h-5" />
          </Link>
        </div>

        {/* Sale Badge */}
        {product.originalPrice && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
            Sale
          </div>
        )}

        {/* Stock Status */}
        {!product.inStock && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            {product.brand}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {product.rating} ({product.reviewCount})
            </span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          <Link
            to={`/products/${product.id}`}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {product.name}
          </Link>
        </h3>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;