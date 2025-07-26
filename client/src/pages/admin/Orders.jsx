import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const response = await axios.get(`/api/orders${params}`);
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status, paymentStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status, paymentStatus });
      toast.success('Order status updated successfully!');
      fetchOrders();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update order status';
      toast.error(message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
      case 'preparing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Orders Management</h1>

          {/* Filter */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders found</h2>
                <p className="text-gray-600">Orders will appear here when customers place them.</p>
              </div>
            ) : (
              orders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Order #{order._id.slice(-8)}</h3>
                      <p className="text-gray-600">Customer: {order.user?.name}</p>
                      <p className="text-gray-600">Email: {order.user?.email}</p>
                      <p className="text-gray-600">Phone: {order.number}</p>
                      <p className="text-gray-600">Address: {order.address}</p>
                      <p className="text-gray-600">Payment: {order.paymentMethod}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-2xl font-bold">${order.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t pt-4 mb-4">
                    <h4 className="font-medium mb-2">Order Items:</h4>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item._id} className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <img
                              src={item.image?.startsWith('http')
                                ? item.image
                                : item.image?.startsWith('/')
                                  ? item.image
                                  : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/uploads/${item.image}`
                              }
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded"
                              onError={(e) => {
                                e.target.src = '/images/placeholder-food.jpg';
                              }}
                            />
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="border-t pt-4 flex space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order Status
                      </label>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value, order.paymentStatus)}
                        className="input-field"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Status
                      </label>
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => updateOrderStatus(order._id, order.status, e.target.value)}
                        className="input-field"
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default Orders;