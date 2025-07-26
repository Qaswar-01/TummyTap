import React, { useState } from 'react';
import GuestCheckout from './GuestCheckout';
import GuestOrderTracking from './GuestOrderTracking';

const GuestOrderExample = () => {
  const [activeTab, setActiveTab] = useState('checkout');
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Example cart items - replace with your actual cart data
  const [cartItems] = useState([
    {
      _id: '507f1f77bcf86cd799439011', // Example product ID
      productId: '507f1f77bcf86cd799439011',
      name: 'Margherita Pizza',
      price: 12.99,
      quantity: 2,
      image: '/images/pizza.jpg'
    },
    {
      _id: '507f1f77bcf86cd799439012',
      productId: '507f1f77bcf86cd799439012',
      name: 'Caesar Salad',
      price: 8.99,
      quantity: 1,
      image: '/images/salad.jpg'
    }
  ]);

  const handleOrderSuccess = (orderData) => {
    setOrderSuccess(orderData);
    setActiveTab('tracking');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Guest Ordering System</h1>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveTab('checkout')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'checkout'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Guest Checkout
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'tracking'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Track Order
            </button>
          </div>
        </div>

        {/* Success Message */}
        {orderSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <h3 className="font-bold">Order Placed Successfully! 🎉</h3>
            <p>Order ID: <strong>{orderSuccess.order._id}</strong></p>
            <p>Status: <strong>{orderSuccess.order.status}</strong></p>
            <p className="text-sm mt-2">{orderSuccess.trackingInfo.message}</p>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'checkout' && (
          <div>
            <div className="mb-6 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Your Cart</h2>
              <div className="space-y-3">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity} × ${item.price}</p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <div className="pt-2 font-bold text-lg">
                  Total: ${cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                </div>
              </div>
            </div>
            
            <GuestCheckout 
              cartItems={cartItems} 
              onOrderSuccess={handleOrderSuccess}
            />
          </div>
        )}

        {activeTab === 'tracking' && (
          <GuestOrderTracking />
        )}

        {/* Features Info */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Guest Ordering Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">✅ No Account Required</h3>
              <p className="text-sm text-blue-700">
                Customers can place orders without creating an account. Just provide basic contact information.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">🚀 Auto-Confirmation</h3>
              <p className="text-sm text-green-700">
                Guest orders are automatically confirmed, eliminating the need for manual approval.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">📱 Order Tracking</h3>
              <p className="text-sm text-purple-700">
                Customers can track their orders using Order ID and email address.
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h3 className="font-semibold text-orange-800 mb-2">💳 Multiple Payment Options</h3>
              <p className="text-sm text-orange-700">
                Support for cash on delivery, credit card, and PayPal payments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestOrderExample;