import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import AdminLayout from '../components/admin/AdminLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiBox, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';

export default function AdminDashboard() {
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
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const overview = stats?.overview || {};
  const categoryBreakdown = Array.isArray(stats?.categoryBreakdown)
    ? stats.categoryBreakdown
    : [];

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome to the admin control panel
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-100 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Products */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Total Products
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {overview.totalProducts || 0}
                  </p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                  <FiBox size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            {/* Total Stock */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Total Stock
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {overview.totalStock || 0}
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                  <FiTrendingUp size={24} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            {/* Low Stock */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Low Stock
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {overview.lowStock || 0}
                  </p>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
                  <FiAlertCircle
                    size={24}
                    className="text-orange-600 dark:text-orange-400"
                  />
                </div>
              </div>
            </div>

            {/* Active Products */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Active Products
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stats.activeProducts || 0}
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                  <FiBox size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/admin/products"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
            >
              Manage Products
            </a>
            <a
              href="/admin/stats"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
            >
              View Inventory Stats
            </a>
          </div>
        </div>

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Category Breakdown
            </h2>
            <div className="space-y-3">
              {categoryBreakdown.map((categoryItem) => {
                const totalCount = categoryBreakdown.reduce(
                  (sum, item) => sum + (item.productCount || 0),
                  0
                );
                const count = categoryItem.productCount || 0;
                const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0.0';
                return (
                  <div key={categoryItem._id || categoryItem.category} className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300 capitalize">
                      {categoryItem._id || 'Unknown'}
                    </span>
                    <div className="flex items-center gap-4">
                      <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${percentage}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-gray-600 dark:text-gray-400 font-semibold w-12 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
