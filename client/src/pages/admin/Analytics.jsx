import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Calendar,
  Download
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({});
  const [systemStats, setSystemStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7');

  useEffect(() => {
    fetchAnalytics();
    fetchSystemStats();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/admin/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    }
  };

  const fetchSystemStats = async () => {
    try {
      const response = await axios.get('/api/admin/system-stats');
      setSystemStats(response.data);
    } catch (error) {
      console.error('Error fetching system stats:', error);
      toast.error('Failed to load system statistics');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (type) => {
    try {
      const response = await axios.get(`/api/admin/export/${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_export_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`${type} data exported successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => exportData('orders')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Orders
              </button>
              <button
                onClick={() => exportData('users')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Users
              </button>
            </div>
          </div>
        </div>

        {/* Time-based Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Today's Orders"
            value={systemStats.today?.orders || 0}
            icon={ShoppingCart}
            color="bg-blue-500"
          />
          <StatCard
            title="Today's Revenue"
            value={`$${(systemStats.today?.revenue || 0).toFixed(2)}`}
            icon={DollarSign}
            color="bg-green-500"
          />
          <StatCard
            title="Weekly Orders"
            value={systemStats.weekly?.orders || 0}
            icon={Calendar}
            color="bg-purple-500"
          />
          <StatCard
            title="New Users This Month"
            value={systemStats.monthly?.newUsers || 0}
            icon={Users}
            color="bg-orange-500"
          />
        </div>

        {/* Monthly Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Monthly Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Monthly Orders</span>
                <span className="text-xl font-bold">{systemStats.monthly?.orders || 0}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Monthly Revenue</span>
                <span className="text-xl font-bold text-green-600">
                  ${(systemStats.monthly?.revenue || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Weekly Revenue</span>
                <span className="text-xl font-bold text-blue-600">
                  ${(systemStats.weekly?.revenue || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Top Products</h3>
            <div className="space-y-3">
              {systemStats.topProducts?.slice(0, 5).map((product, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.totalSold} sold</p>
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    ${product.revenue.toFixed(2)}
                  </span>
                </div>
              )) || (
                <p className="text-gray-500 text-center">No data available</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Category Sales */}
        {analytics.categorySales && analytics.categorySales.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.categorySales.map((category, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium capitalize">{category._id}</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    ${category.totalSales.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {category.itemCount} items sold
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Analytics;