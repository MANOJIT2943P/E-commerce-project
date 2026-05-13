import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, Shield, Truck, Search, ShoppingBag } from 'lucide-react';

// Slices & Services
import { setSearchQuery, setRecommendedProducts } from '../../store/slices/productSlice';
import { recommendService } from '../../services/recommendService';
import { API_HOST as PRODUCT_API_HOST } from '../../services/productService';
import { mergeSearchAndRecommendations } from '../../utils/mergeSearchAndRecommendations';
import { searchHistoryService } from '../../services/searchHistoryService';
import SearchHistoryDropdown from '../common/SearchHistoryDropdown';

const HeroSection = () => {
  const features = [
    {
      icon: Star,
      title: 'Premium Quality',
      description: 'Handpicked trusted brands',
    },
    {
      icon: Shield,
      title: 'Secure Shopping',
      description: 'Buyer protection guaranteed',
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Free over $100',
    },
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center bg-[#0f172a] overflow-hidden py-16 lg:py-0">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-left"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <ShoppingBag size={14} />
              <span>New Season Collection 2024</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6">
              Elevate Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
                Lifestyle Store
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg text-slate-400 mb-10 max-w-lg leading-relaxed">
              Experience the future of shopping with our AI-curated collections. 
              Quality meets affordability in every single click.
            </motion.p>
            
            <motion.div variants={itemVariants} className="mb-10">
              <SearchForm />
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-6">
              <Link
                to="/products"
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-bold rounded-xl overflow-hidden transition-all hover:bg-blue-700 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              >
                <span className="relative z-10 flex items-center">
                  Start Shopping
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <img 
                    key={i} 
                    className="w-10 h-10 rounded-full border-2 border-[#0f172a]" 
                    src={`https://i.pravatar.cc/100?img=${i+10}`} 
                    alt="user" 
                  />
                ))}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-[#0f172a] bg-slate-800 text-[10px] text-white font-bold">
                  10k+
                </div>
              </div>
            </motion.div>

            {/* Micro Features */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 border-t border-slate-800">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <feature.icon className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-slate-300">{feature.title}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Image Side */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            {/* Floating Decorative Card */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 z-20 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Shield className="text-green-400" size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Trusted Seller</p>
                  <p className="text-sm font-bold text-white">Verified Store</p>
                </div>
              </div>
            </motion.div>

            <div className="relative z-10 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
              <img
                src="https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Shopping Experience"
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            
            {/* Background Glows */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-600/30 rounded-full blur-3xl animate-pulse" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

function SearchForm() {
  const [q, setQ] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e?.preventDefault();
    if (!q.trim()) return;

    const keyword = q.trim();
    dispatch(setSearchQuery(keyword));

    try {
      const recResults = await recommendService.getRecommendations(keyword).catch(() => []);
      const combined = mergeSearchAndRecommendations([], recResults, PRODUCT_API_HOST);
      dispatch(setRecommendedProducts(combined));
    } catch (err) {
      console.error('Search failed:', err);
    }

    try { await searchHistoryService.saveSearch(keyword); } catch (e) {}

    navigate('/products');
    setQ('');
    setShowHistory(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <form 
        onSubmit={onSubmit} 
        className="group flex items-center bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-1.5 transition-all focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10"
      >
        <div className="pl-4 text-slate-500">
          <Search size={20} />
        </div>
        <input
          type="text"
          className="w-full px-4 py-3 bg-transparent text-white outline-none placeholder:text-slate-500"
          placeholder="Search for 'iPhone'..."
          value={q}
          onChange={(e) => { setQ(e.target.value); setShowHistory(true); }}
          onFocus={async () => {
            try {
              const h = await searchHistoryService.getSearchHistory();
              setHistory(h || []);
              setShowHistory(true);
            } catch (err) {
              setHistory([]);
            }
          }}
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-lg"
        >
          Search
        </button>
      </form>

      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <SearchHistoryDropdown
              items={history}
              query={q}
              visible={showHistory}
              onSelect={(val) => {
                setQ(val);
                setTimeout(() => onSubmit(), 50);
              }}
              onClear={async () => { 
                await searchHistoryService.clearSearchHistory(); 
                setHistory([]); 
                setShowHistory(false); 
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HeroSection;