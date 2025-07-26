import React, { useState } from 'react';
import api from '../utils/api';

const GuestOrderTracking = () => {
  const [trackingData, setTrackingData] = useState({
    orderId: '',
    email: ''
  });
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setTrackingData({
      ...trackingData,
      [e.target.name]: e.target.value
    });
  };

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await api.get(
        `/api/orders/track/${trackingData.orderId}?email=${trackingData.email}`
      );
      setOrder(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      preparing: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Track Your Order</h2>
      
      <form onSubmit={handleTrackOrder} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order ID *
          </label>
          <input
            type="text"
            name="orderId"
            value={trackingData.orderId}
            onChange={handleInputChange}
            required
            placeholder="Enter your order ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={trackingData.email}
            onChange={handleInputChange}
            required
            placeholder="Enter the email used for the order"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Tracking...' : 'Track Order'}
        </button>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {order && (
        <div className="border rounded-lg p-6 bg-gray-50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">Order #{order._id.slice(-8)}</h3>
              <p className="text-gray-600">
                {order.isGuestOrder ? 'Guest Order' : 'Registered User Order'}
              </p>
            </div>
            <div className="text-right">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium text-gray-700">Customer Details</h4>
              <p className="text-sm text-gray-600">Name: {order.name}</p>
              <p className="text-sm text-gray-600">Email: {order.email}</p>
              <p className="text-sm text-gray-600">Phone: {order.number}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Delivery Address</h4>
              <p className="text-sm text-gray-600">{order.address}</p>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Order Items</h4>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded mr-3"
                      />
                    )}
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div>
              <p className="text-sm text-gray-600">Payment Method: {order.paymentMethod}</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                Payment: {order.paymentStatus.toUpperCase()}
              </span>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">Total: ${order.totalPrice.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p>Order placed: {new Date(order.createdAt).toLocaleString()}</p>
            <p>Last updated: {new Date(order.updatedAt).toLocaleString()}</p>
          </div>

          {order.status === 'confirmed' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-700">
                ✅ Your order has been automatically confirmed and is being prepared!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GuestOrderTracking;