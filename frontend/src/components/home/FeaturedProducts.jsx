import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShoppingCart, Heart, Eye, ArrowRight, Sparkles } from 'lucide-react';
import { productService, API_HOST } from '../../services/productService';
import { recommendService } from '../../services/recommendService';
import { useCart } from '../../hooks/useCart';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlist, setWishlist] = useState({});
  const { addItem } = useCart();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const recommended = await recommendService.getRecommendations('iPhone');
        const mapped = recommended.map((r) => {
          const mongoId = r._id != null ? String(r._id) : r.id != null ? String(r.id) : '';
          const uid = r.uid != null ? String(r.uid) : '';
          const price = typeof r.price === 'number' ? r.price : r.original_price;
          return {
            id: mongoId,
            name: r.name,
            price,
            originalPrice: typeof r.original_price === 'number' ? r.original_price : price,
            rating: r.rating || 4.5,
            brand: r.brand || 'Premium',
            description: r.description || 'Special featured product recommended for you.',
            images: [`${API_HOST.replace(/\/$/, '')}/images/${encodeURIComponent(uid || mongoId)}.jpg`],
          };
        });
        setProducts(mapped.slice(0, 4));
      } catch (error) {
        try {
          const featuredProducts = await productService.getFeaturedProducts();
          setProducts(featuredProducts);
        } catch (fallbackError) {
          console.error('Fetch error:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  const handleAddToCart = (product) => {
    const isValidId = (id) => /^[a-f\d]{24}$/i.test(id);
    if (!isValidId(product.id)) {
      toast.error('Product temporarily unavailable');
      return;
    }
    addItem(product.id, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const toggleWishlist = (id) => {
    setWishlist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) return <section className="py-24 bg-white dark:bg-[#0f172a]"><LoadingSpinner size="large" /></section>;

  return (
    <section className="py-24 bg-gray-50 dark:bg-[#0f172a] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold mb-4 tracking-widest"
          >
            <Sparkles size={12} />
            <span>CURATED COLLECTION</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6"
          >
            Featured <span className="text-blue-600">Products</span>
          </motion.h2>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 p-3 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10"
            >
              {/* Image Container - FIXED ZOOM HERE */}
              <div className="relative aspect-square rounded-[1.5rem] bg-gray-50 dark:bg-slate-800/50 overflow-hidden flex items-center justify-center p-6">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.originalPrice > product.price && (
                    <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  )}
                </div>

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                   <button 
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-3 rounded-full shadow-xl transition-all hover:scale-110 ${wishlist[product.id] ? 'bg-red-500 text-white' : 'bg-white text-gray-900'}`}
                  >
                    <Heart size={18} className={wishlist[product.id] ? 'fill-current' : ''} />
                  </button>
                  <Link 
                    to={`/products/${product.id}`}
                    className="p-3 bg-white text-gray-900 rounded-full shadow-xl transition-all hover:scale-110"
                  >
                    <Eye size={18} />
                  </Link>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 pt-5">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter bg-blue-500/5 px-2 py-0.5 rounded">
                    {product.brand}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-400 fill-current" />
                    <span className="text-xs font-bold text-gray-500">{product.rating}</span>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 line-clamp-1">
                  {product.name}
                </h3>
                
                <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mb-4 min-h-[32px]">
                  {product.description}
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-black text-gray-900 dark:text-white">
                      ${product.price}
                    </p>
                    {product.originalPrice > product.price && (
                      <p className="text-xs text-gray-400 line-through">${product.originalPrice}</p>
                    )}
                  </div>
                  
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleAddToCart(product)}
                    className="flex items-center justify-center w-12 h-12 bg-gray-900 dark:bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                  >
                    <ShoppingCart size={20} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All */}
        <div className="mt-16 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-3 px-8 py-4 bg-transparent border-2 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white font-bold rounded-2xl hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all group"
          >
            <span>Explore Full Catalog</span>
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;