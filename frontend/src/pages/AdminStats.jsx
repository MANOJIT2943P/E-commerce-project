import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiBarChart2, FiAlertTriangle } from 'react-icons/fi';

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getInventoryStats();
      setStats(data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load inventory statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  const overview = stats?.overview || {};
  const categoryBreakdown = Array.isArray(stats?.categoryBreakdown)
    ? stats.categoryBreakdown
    : [];
  const averagePrice = overview.totalProducts > 0 ? overview.totalValue / overview.totalProducts : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiBarChart2 size={32} />
            Inventory Statistics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Detailed inventory analytics and insights
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-100 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {stats && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">
                  Total Products
                </h3>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  {overview.totalProducts || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">
                  Total Stock Units
                </h3>
                <p className="text-4xl font-bold text-green-600">
                  {overview.totalStock || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">
                  Low Stock Items
                </h3>
                <p className="text-4xl font-bold text-orange-600">
                  {overview.lowStock || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">
                  Average Price
                </h3>
                <p className="text-4xl font-bold text-blue-600">
                  ${averagePrice.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Category Breakdown */}
            {categoryBreakdown.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Products by Category
                </h2>
                <div className="space-y-4">
                  {categoryBreakdown.map((categoryItem) => {
                    const totalCount = categoryBreakdown.reduce(
                      (sum, item) => sum + (item.productCount || 0),
                      0
                    );
                    const count = categoryItem.productCount || 0;
                    const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0.0';
                    return (
                      <div key={categoryItem._id || categoryItem.category}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-700 dark:text-gray-300 capitalize font-semibold">
                            {categoryItem._id || 'Unknown'}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 text-sm">
                            {count} products ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Brand Breakdown */}
            {stats.brandBreakdown && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Products by Brand
                </h2>
                <div className="space-y-4">
                  {Object.entries(stats.brandBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10)
                    .map(([brand, count]) => {
                      const total = Object.values(stats.brandBreakdown).reduce(
                        (a, b) => a + b,
                        0
                      );
                      const percentage = ((count / total) * 100).toFixed(1);
                      return (
                        <div key={brand}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-700 dark:text-gray-300 font-semibold">
                              {brand}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400 text-sm">
                              {count} products ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Stock Status Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FiAlertTriangle size={24} />
                Stock Status Distribution
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg p-6 border border-green-200 dark:border-green-700">
                  <h3 className="text-green-900 dark:text-green-100 font-semibold mb-2">
                    Good Stock
                  </h3>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-200">
                    {stats.goodStockCount || 0}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                    Stock &gt; 20 units
                  </p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 rounded-lg p-6 border border-yellow-200 dark:border-yellow-700">
                  <h3 className="text-yellow-900 dark:text-yellow-100 font-semibold mb-2">
                    Medium Stock
                  </h3>
                  <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-200">
                    {stats.mediumStockCount || 0}
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                    Stock 5-20 units
                  </p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 rounded-lg p-6 border border-red-200 dark:border-red-700">
                  <h3 className="text-red-900 dark:text-red-100 font-semibold mb-2">
                    Low Stock
                  </h3>
                  <p className="text-3xl font-bold text-red-700 dark:text-red-200">
                    {stats.lowStockCount || 0}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                    Stock &lt; 5 units
                  </p>
                </div>
              </div>
            </div>

            {/* Price Statistics */}
            {stats.priceStats && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Price Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                    <p className="text-blue-900 dark:text-blue-100 text-sm font-semibold mb-1">
                      Minimum Price
                    </p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">
                      ${(stats.priceStats.min || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <p className="text-green-900 dark:text-green-100 text-sm font-semibold mb-1">
                      Average Price
                    </p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-200">
                      ${(stats.priceStats.avg || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                    <p className="text-purple-900 dark:text-purple-100 text-sm font-semibold mb-1">
                      Median Price
                    </p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-200">
                      ${(stats.priceStats.median || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
                    <p className="text-orange-900 dark:text-orange-100 text-sm font-semibold mb-1">
                      Maximum Price
                    </p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-200">
                      ${(stats.priceStats.max || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
