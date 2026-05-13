import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  Grid, 
  List, 
  SortAsc, 
  Search, 
  ChevronDown, 
  Sparkles,
  X 
} from 'lucide-react';

// Components & Services
import Layout from '../components/common/Layout';
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { setProducts, updateFilters, setSortBy } from '../store/slices/productSlice';
import { productService } from '../services/productService';

const Products = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { 
    filteredProducts, 
    isLoading, 
    sortBy, 
    searchQuery, 
    isUsingRecommendations 
  } = useSelector((state) => state.products);
  
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await productService.getProducts();
        dispatch(setProducts(products));
        
        const categoryFromUrl = searchParams.get('category');
        if (categoryFromUrl) {
          dispatch(updateFilters({ category: categoryFromUrl }));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, [dispatch, searchParams]);

  const handleSortChange = (newSortBy) => {
    dispatch(setSortBy(newSortBy));
  };

  const sortOptions = [
    { value: 'name', label: 'Name A-Z' },
    { value: 'price-low', label: 'Price: Low-High' },
    { value: 'price-high', label: 'Price: High-Low' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <Layout
      title="Collections - ShopEase"
      description="Explore our curated collections"
    >
      <div className="bg-gray-50 dark:bg-[#0b0f1a] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          {/* Top Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {isUsingRecommendations && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 text-xs font-bold uppercase tracking-wider">
                    <Sparkles size={12} />
                    AI Recommended
                  </span>
                )}
                <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">
                  Collections
                </span>
              </div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                {searchQuery ? (
                  <>Results for <span className="text-blue-600">"{searchQuery}"</span></>
                ) : 'All Products'}
              </h1>
              <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">
                Showing {filteredProducts.length} high-quality items
              </p>
            </div>

            {/* Desktop Controls */}
            <div className="flex items-center gap-4">
              {/* Sort Select Custom Styled */}
              <div className="relative group">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm font-bold text-gray-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer transition-all hover:border-gray-300"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>

              {/* View Toggle */}
              <div className="hidden sm:flex bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-slate-800 text-blue-600 shadow-inner' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-gray-100 dark:bg-slate-800 text-blue-600 shadow-inner' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List size={18} />
                </button>
              </div>

              {/* Mobile Filter Trigger */}
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all"
              >
                <Filter size={16} />
                Filters
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar / Filters */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-28 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-50 dark:border-slate-800">
                  <Filter size={18} className="text-blue-600" />
                  <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">Refine Search</h3>
                </div>
                <ProductFilters />
              </div>
            </aside>

            {/* Mobile Filters Drawer */}
            <AnimatePresence>
              {showFilters && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowFilters(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden" 
                  />
                  <motion.div 
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed right-0 top-0 h-full w-full max-w-xs bg-white dark:bg-slate-900 z-[101] shadow-2xl lg:hidden p-6 overflow-y-auto"
                  >
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-xl font-black text-gray-900 dark:text-white">Filters</h2>
                      <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
                        <X size={24} />
                      </button>
                    </div>
                    <ProductFilters />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-32"
                  >
                    <LoadingSpinner size="large" />
                    <p className="mt-4 text-gray-500 font-medium animate-pulse">Syncing catalog...</p>
                  </motion.div>
                ) : filteredProducts.length === 0 ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-slate-800"
                  >
                    <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                      <Search size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No items found</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                      We couldn't find any products matching your current filters. Try resetting them!
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                        : 'flex flex-col gap-6'
                    }
                  >
                    {filteredProducts.map((product) => (
                      <motion.div key={product.id} variants={itemVariants}>
                        <ProductCard
                          product={product}
                          viewMode={viewMode}
                          fromSearchContext={Boolean(searchQuery?.trim()) || isUsingRecommendations}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;