import React, { useState } from 'react';
import api from '../utils/api';

const GuestCheckout = ({ cartItems, onOrderSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number: '',
    address: '',
    paymentMethod: 'cash on delivery'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare order items
      const items = cartItems.map(item => ({
        productId: item.productId || item._id,
        quantity: item.quantity
      }));

      const orderData = {
        ...formData,
        items
      };

      const response = await api.post('/api/orders/guest', orderData);
      
      // Order successful
      onOrderSuccess(response.data);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        number: '',
        address: '',
        paymentMethod: 'cash on delivery'
      });

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Guest Checkout</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            maxLength={50}
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
            value={formData.email}
            onChange={handleInputChange}
            required
            maxLength={50}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            name="number"
            value={formData.number}
            onChange={handleInputChange}
            required
            maxLength={10}
            pattern="[0-9]{10}"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Address *
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            maxLength={500}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method *
          </label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="cash on delivery">Cash on Delivery</option>
            <option value="credit card">Credit Card</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Total: ${calculateTotal().toFixed(2)}</span>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Placing Order...' : 'Place Order (Auto-Confirmed)'}
          </button>
        </div>
      </form>

      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
        <p className="text-sm text-green-700">
          ✅ <strong>No account required!</strong> Your order will be automatically confirmed.
          You'll receive an order ID to track your order.
        </p>
      </div>
    </div>
  );
};

export default GuestCheckout;