import { useState, useEffect } from 'react';
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, Clock, AlertTriangle, Shield, Activity, Server, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      const [dashboardResponse, securityResponse] = await Promise.all([
        axios.get('/api/admin/dashboard'),
        axios.get('/api/admin/security/audit').catch(() => ({ data: null }))
      ]);

      console.log('Dashboard response:', dashboardResponse.data);
      setStats({
        ...dashboardResponse.data.stats,
        security: securityResponse.data
      });
      setRecentOrders(dashboardResponse.data.recentOrders || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default stats if API fails
      setStats({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        totalRevenue: 0,
        pendingRevenue: 0,
        completedRevenue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders || 0,
      icon: <ShoppingCart className="w-8 h-8" />,
      gradient: 'from-slate-600 to-gray-700',
      bgGradient: 'from-slate-50 to-gray-100',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Total Revenue',
      value: `$${(stats.completedRevenue || 0).toFixed(2)}`,
      icon: <DollarSign className="w-8 h-8" />,
      gradient: 'from-emerald-600 to-green-700',
      bgGradient: 'from-emerald-50 to-green-100',
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts || 0,
      icon: <Package className="w-8 h-8" />,
      gradient: 'from-gray-600 to-slate-700',
      bgGradient: 'from-gray-50 to-slate-100',
      change: '+3%',
      changeType: 'increase'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: <Users className="w-8 h-8" />,
      gradient: 'from-slate-700 to-gray-800',
      bgGradient: 'from-slate-50 to-gray-100',
      change: '+15%',
      changeType: 'increase'
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="loading-spinner mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          <div className="relative">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-700 via-gray-800 to-slate-900 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-slate-600 mt-2 text-lg">Welcome back! Here's what's happening with your restaurant today.</p>
            <div className="absolute -top-2 -left-2 w-20 h-20 bg-gradient-to-r from-slate-400/20 to-gray-400/20 rounded-full blur-xl"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg border border-slate-200/50">
              <span className="text-sm text-slate-500 block">Last updated</span>
              <p className="font-semibold text-slate-800">{new Date().toLocaleTimeString()}</p>
            </div>
            <div className="bg-gradient-to-r from-slate-600 to-gray-700 text-white rounded-xl px-6 py-3 shadow-lg">
              <span className="text-sm opacity-90 block">Status</span>
              <p className="font-semibold">All Systems Go! 🚀</p>
            </div>
          </div>
        </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`relative bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/30 overflow-hidden group cursor-pointer`}
              >
                {/* Animated background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>

                {/* Floating orbs */}
                <div className={`absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r ${stat.gradient} opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity duration-500`}></div>
                <div className={`absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r ${stat.gradient} opacity-5 rounded-full blur-lg group-hover:opacity-15 transition-opacity duration-500`}></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`bg-gradient-to-r ${stat.gradient} text-white p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                      {stat.icon}
                    </div>
                    <div className={`text-xs font-bold px-3 py-2 rounded-full shadow-md ${
                      stat.changeType === 'increase'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                        : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                    }`}>
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">{stat.title}</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent group-hover:from-gray-900 group-hover:to-gray-700 transition-all duration-300">{stat.value}</p>
                  </div>
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </motion.div>
            ))}
          </div>




          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/30 relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-400/10 to-orange-400/10 rounded-full blur-xl"></div>

            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Recent Orders</h2>
                  <p className="text-sm text-gray-500">Latest customer orders</p>
                </div>
              </div>
              <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:scale-105">
                View All Orders
              </button>
            </div>
            
            {recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">No recent orders</p>
                <p className="text-gray-400 text-sm mt-1">Orders will appear here once customers start placing them</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Order ID</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Customer</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Total</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order, index) => (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            #{order._id.slice(-8)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white text-xs font-bold">
                                {order.user?.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <span className="font-medium text-gray-900">{order.user?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-green-600">${order.totalPrice.toFixed(2)}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
      </motion.div>
    </AdminLayout>
  );
};

export default Dashboard;