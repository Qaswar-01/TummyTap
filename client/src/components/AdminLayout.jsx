import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  MessageSquare,
  Settings,
  Activity,
  BarChart3,
  LogOut,
  Menu,
  X,
  Server
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', color: 'from-slate-600 to-gray-700' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics', color: 'from-slate-500 to-gray-600' },
    { path: '/admin/products', icon: Package, label: 'Products', color: 'from-gray-600 to-slate-700' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders', color: 'from-slate-700 to-gray-800' },
    { path: '/admin/users', icon: Users, label: 'Users', color: 'from-gray-500 to-slate-600' },
    { path: '/admin/messages', icon: MessageSquare, label: 'Messages', color: 'from-slate-600 to-gray-700' },
    { path: '/admin/activity-logs', icon: Activity, label: 'Activity Logs', color: 'from-gray-500 to-slate-500' },
    { path: '/admin/system', icon: Server, label: 'System', color: 'from-gray-600 to-slate-700' },
    { path: '/admin/settings', icon: Settings, label: 'Settings', color: 'from-slate-700 to-gray-800' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:z-auto ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/20 bg-gradient-to-r from-slate-800 via-gray-800 to-slate-900 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-700/30 via-gray-700/30 to-slate-800/30 animate-pulse"></div>

          <div className="flex items-center relative z-10">
            <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <span className="text-2xl">🍕</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">FoodAdmin</h1>
              <p className="text-xs text-white/80">Management Portal</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white transition-colors relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3 space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden ${
                  isActive
                    ? `bg-gradient-to-r ${item.color} text-white shadow-xl transform scale-105`
                    : 'text-gray-700 hover:text-white hover:shadow-lg hover:transform hover:scale-105'
                }`}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
                onClick={() => {
                  // Only close sidebar on mobile
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
              >
                {/* Hover background */}
                {!isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                )}

                {/* Icon with background */}
                <div className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-300 ${
                  isActive
                    ? 'bg-white/20 backdrop-blur-sm'
                    : 'bg-gray-100 group-hover:bg-white/20 group-hover:backdrop-blur-sm'
                }`}>
                  <Icon className={`w-5 h-5 transition-colors duration-300 ${
                    isActive ? 'text-white' : `text-gray-600 group-hover:text-white`
                  }`} />
                </div>

                <span className="relative z-10 font-medium">{item.label}</span>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="group flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:text-white rounded-xl transition-all duration-300 relative overflow-hidden hover:shadow-xl"
          >
            {/* Hover background */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative z-10 w-8 h-8 rounded-lg bg-red-50 group-hover:bg-white/20 flex items-center justify-center mr-3 transition-all duration-300">
              <LogOut className="w-5 h-5 transition-colors duration-300 group-hover:text-white" />
            </div>
            <span className="relative z-10 font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-slate-200/20 to-gray-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-gray-200/20 to-slate-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>

        {/* Top bar */}
        <div className="bg-white/90 backdrop-blur-md shadow-xl border-b border-slate-200/50 h-16 flex items-center justify-between px-6 relative z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-gradient-to-r hover:from-slate-600 hover:to-gray-700 hover:text-white transition-all duration-300"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-3 bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-2 rounded-full border border-emerald-200/50">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-emerald-700 font-semibold">
                System Online
              </span>
            </div>
            <div className="flex items-center space-x-3 bg-gradient-to-r from-slate-50 to-gray-50 backdrop-blur-sm px-5 py-3 rounded-full shadow-lg border border-slate-200/50">
              <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-gray-700 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <div>
                <span className="text-sm text-slate-700 font-semibold block">Admin User</span>
                <span className="text-xs text-slate-500">Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6 min-h-screen relative z-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;