import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import {
  FiMenu,
  FiX,
  FiHome,
  FiBox,
  FiBarChart2,
  FiLogOut,
  FiUser,
} from 'react-icons/fi';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: FiHome },
    { name: 'Products', path: '/admin/products', icon: FiBox },
    { name: 'Inventory Stats', path: '/admin/stats', icon: FiBarChart2 },
    { name: 'Register Admin', path: '/admin/register', icon: FiUser },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-br from-indigo-600 to-blue-600 dark:from-indigo-900 dark:to-blue-900 text-white transition-all duration-300 ease-in-out flex flex-col`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-indigo-500">
          {sidebarOpen && <h1 className="text-xl font-bold">Admin Panel</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-indigo-700 p-2 rounded-lg transition-colors"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-indigo-800 text-white'
                  : 'text-indigo-100 hover:bg-indigo-700'
              }`}
              title={!sidebarOpen ? item.name : ''}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="border-t border-indigo-500 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-400 rounded-full flex items-center justify-center">
              <FiUser size={20} />
            </div>
            {sidebarOpen && (
              <div className="flex-1 truncate">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-indigo-200 truncate">{user?.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors w-full justify-center ${
              !sidebarOpen && 'justify-start'
            }`}
            title="Logout"
          >
            <FiLogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            E-Commerce Admin
          </h2>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
